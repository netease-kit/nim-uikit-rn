import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import * as FileSystem from 'expo-file-system/legacy'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

import { toast } from '@/src/NEUIKit/common/utils/toast'
import { resolveFileName } from '@/utils/fileTransfer'
import { getAttachmentExtension, normalizeMediaRenderSource } from '@/utils/media-source'
import { getMessageKey } from '@/utils/messageForward'
import { V2NIMMessage, V2NIMMessageAudioAttachment, V2NIMMessageType } from '@/utils/nim-sdk'

const AUDIO_PLAYBACK_FALLBACK_BUFFER_MS = 600
const AUDIO_PLAYBACK_STATUS_STALL_FALLBACK_MS = 3000
const IOS_PLAYBACK_SWITCH_SETTLE_MS = 150
const AUDIO_PLAYBACK_CACHE_DIR = `${FileSystem.cacheDirectory || ''}im2-audio-playback/`
const MIN_VOICE_DURATION_MS = 1000
const MAX_VOICE_DURATION_SECONDS = 60
const IOS_VOICE_DEBUG_TAG = '[ChatVoiceDebug]'

function logIOSVoiceDebug(event: string, payload?: Record<string, unknown>) {
  if (__DEV__ && Platform.OS === 'ios') {
    console.info(`${IOS_VOICE_DEBUG_TAG} ${event}`, payload)
  }
}

async function getAudioDebugFileInfo(uri: string) {
  if (!uri || uri.startsWith('http://') || uri.startsWith('https://')) {
    return undefined
  }

  try {
    const info = await FileSystem.getInfoAsync(uri)

    return {
      uri,
      exists: info.exists,
      size: info.exists && typeof info.size === 'number' ? info.size : undefined
    }
  } catch (error) {
    return {
      uri,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

function getPlayableAudioAttachmentSource(attachment?: V2NIMMessageAudioAttachment | null) {
  return normalizeMediaRenderSource(attachment?.url) || normalizeMediaRenderSource(attachment?.path)
}

function normalizeNativeAudioSource(source: string) {
  if (!source) {
    return ''
  }

  if (
    source.startsWith('file://') ||
    source.startsWith('content://') ||
    source.startsWith('http://') ||
    source.startsWith('https://')
  ) {
    return source
  }

  return source.startsWith('/') ? `file://${source}` : source
}

function isRemoteAudioSource(source: string) {
  return source.startsWith('http://') || source.startsWith('https://')
}

function sanitizeAudioCacheKey(key: string) {
  return key.replace(/[^A-Za-z0-9._-]/g, '_')
}

async function ensureAudioPlaybackCacheDir() {
  if (!AUDIO_PLAYBACK_CACHE_DIR) {
    return
  }

  const info = await FileSystem.getInfoAsync(AUDIO_PLAYBACK_CACHE_DIR)

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_PLAYBACK_CACHE_DIR, { intermediates: true })
  }
}

async function resolvePlayableAudioSourceForNative(
  source: string,
  messageKey: string,
  attachment?: V2NIMMessageAudioAttachment | null
) {
  if (!isRemoteAudioSource(source)) {
    return source
  }

  await ensureAudioPlaybackCacheDir()
  const attachmentExtension = getAttachmentExtension(attachment)
  const fileName = resolveFileName(
    source,
    attachment?.name || `audio-${messageKey}`,
    attachmentExtension || 'm4a'
  )
  const localUri = `${AUDIO_PLAYBACK_CACHE_DIR}${sanitizeAudioCacheKey(messageKey)}-${fileName}`
  const cachedInfo = await FileSystem.getInfoAsync(localUri)

  if (!cachedInfo.exists) {
    logIOSVoiceDebug('playback.download.start', {
      messageKey,
      source,
      localUri,
      attachmentName: attachment?.name,
      attachmentExtension,
      attachmentDuration: attachment?.duration
    })
    await FileSystem.downloadAsync(source, localUri)
    const downloadedInfo = await FileSystem.getInfoAsync(localUri)
    logIOSVoiceDebug('playback.download.done', {
      messageKey,
      localUri,
      exists: downloadedInfo.exists,
      size:
        downloadedInfo.exists && typeof downloadedInfo.size === 'number'
          ? downloadedInfo.size
          : undefined
    })
  } else {
    logIOSVoiceDebug('playback.cache.hit', {
      messageKey,
      localUri,
      exists: cachedInfo.exists,
      size: cachedInfo.exists && typeof cachedInfo.size === 'number' ? cachedInfo.size : undefined
    })
  }

  return localUri
}

export async function configureVoiceRecordingAudioMode() {
  if (Platform.OS === 'ios') {
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      shouldRouteThroughEarpiece: false
    })
    return
  }

  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true
  })
}

export async function configureVoicePlaybackAudioMode() {
  if (Platform.OS === 'ios') {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false
    })
    return
  }

  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true
  })
}

type MessageAudioPlaybackTranslations = {
  playFailedTitle: string
  unavailable: string
  playFailed: string
}

const audioPlaybackStopHandlers = new Set<() => void>()

function waitForPlaybackSwitchSettle() {
  if (Platform.OS !== 'ios') {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    setTimeout(resolve, IOS_PLAYBACK_SWITCH_SETTLE_MS)
  })
}

export function stopAllMessageAudioPlayback() {
  audioPlaybackStopHandlers.forEach((stopPlayback) => {
    stopPlayback()
  })
}

export function useMessageAudioPlayback(translations: MessageAudioPlaybackTranslations) {
  const [playingAudioMessageId, setPlayingAudioMessageId] = useState<string | null>(null)
  const audioPlayerRef = useRef<AudioPlayer | null>(null)
  const audioPlaybackStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playbackRequestSeqRef = useRef(0)
  const playbackQueueRef = useRef(Promise.resolve())

  const clearAudioPlaybackStopTimer = useCallback(() => {
    if (audioPlaybackStopTimerRef.current) {
      clearTimeout(audioPlaybackStopTimerRef.current)
      audioPlaybackStopTimerRef.current = null
    }
  }, [])

  const stopCurrentAudioPlayer = useCallback(() => {
    clearAudioPlaybackStopTimer()
    const hadPlayer = !!audioPlayerRef.current
    audioPlayerRef.current?.pause()
    audioPlayerRef.current?.remove()
    audioPlayerRef.current = null
    setPlayingAudioMessageId(null)
    return hadPlayer
  }, [clearAudioPlaybackStopTimer])

  const stopAudioPlayback = useCallback(() => {
    playbackRequestSeqRef.current += 1
    stopCurrentAudioPlayer()
  }, [stopCurrentAudioPlayer])

  const playAudioMessage = useCallback(
    async (message: V2NIMMessage) => {
      if (message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) {
        return false
      }

      const messageKey = getMessageKey(message)
      const audioAttachment = message.attachment as V2NIMMessageAudioAttachment | undefined
      const audioAttachmentDebug = audioAttachment as
        | (V2NIMMessageAudioAttachment & {
            ext?: unknown
            size?: unknown
            raw?: unknown
          })
        | undefined
      const source = normalizeNativeAudioSource(getPlayableAudioAttachmentSource(audioAttachment))
      logIOSVoiceDebug('playback.tap', {
        messageKey,
        messageClientId: message.messageClientId,
        messageServerId: message.messageServerId,
        senderId: message.senderId,
        attachmentDuration: audioAttachment?.duration,
        attachmentName: audioAttachment?.name,
        attachmentExt: audioAttachmentDebug?.ext,
        attachmentSize: audioAttachmentDebug?.size,
        attachmentRaw: audioAttachmentDebug?.raw,
        attachmentPath: audioAttachment?.path,
        attachmentUrl: audioAttachment?.url,
        normalizedSource: source,
        currentPlayingAudioMessageId: playingAudioMessageId
      })

      if (!source) {
        logIOSVoiceDebug('playback.source.missing', {
          messageKey,
          attachment: audioAttachment
        })
        toast.alert(translations.playFailedTitle, translations.unavailable)
        return true
      }

      if (playingAudioMessageId === messageKey) {
        logIOSVoiceDebug('playback.toggle.stop', { messageKey })
        stopAudioPlayback()
        return true
      }

      const requestSeq = ++playbackRequestSeqRef.current

      const playRequest = async () => {
        const stoppedExistingPlayer = stopCurrentAudioPlayer()

        if (stoppedExistingPlayer) {
          logIOSVoiceDebug('playback.switch.settle.start', {
            messageKey,
            requestSeq,
            settleMs: Platform.OS === 'ios' ? IOS_PLAYBACK_SWITCH_SETTLE_MS : 0
          })
          await waitForPlaybackSwitchSettle()
          logIOSVoiceDebug('playback.switch.settle.done', { messageKey, requestSeq })
        }

        if (requestSeq !== playbackRequestSeqRef.current) {
          logIOSVoiceDebug('playback.request.superseded.beforeStart', {
            messageKey,
            requestSeq,
            latestRequestSeq: playbackRequestSeqRef.current
          })
          return true
        }

        await configureVoicePlaybackAudioMode()
        const playbackSource = await resolvePlayableAudioSourceForNative(
          source,
          messageKey,
          audioAttachment
        )
        logIOSVoiceDebug('playback.source.resolved', {
          messageKey,
          source,
          playbackSource,
          fileInfo: await getAudioDebugFileInfo(playbackSource)
        })
        if (requestSeq !== playbackRequestSeqRef.current) {
          logIOSVoiceDebug('playback.request.superseded.afterResolve', {
            messageKey,
            requestSeq,
            latestRequestSeq: playbackRequestSeqRef.current
          })
          return true
        }

        const player = createAudioPlayer({ uri: playbackSource }, { updateInterval: 250 })
        player.muted = false
        player.volume = 1
        audioPlayerRef.current = player
        setPlayingAudioMessageId(messageKey)
        const attachmentDurationMs = Math.round(audioAttachment?.duration || 0)
        const fallbackDurationMs = Math.max(
          MIN_VOICE_DURATION_MS,
          attachmentDurationMs || MAX_VOICE_DURATION_SECONDS * 1000
        )
        clearAudioPlaybackStopTimer()
        audioPlaybackStopTimerRef.current = setTimeout(() => {
          if (audioPlayerRef.current === player) {
            stopCurrentAudioPlayer()
          }
        }, fallbackDurationMs + AUDIO_PLAYBACK_STATUS_STALL_FALLBACK_MS)
        let hasUpdatedFallbackStopFromStatus = false
        let lastLoggedStatusSecond = -1
        let lastLoggedStatusState = ''
        player.addListener('playbackStatusUpdate', (status) => {
          const duration = status.duration || 0
          const currentTime = status.currentTime || 0
          const statusSecond = Math.floor(currentTime)
          const statusState = `${status.playing}:${status.playbackState}:${status.timeControlStatus}:${status.isLoaded}:${status.isBuffering}`
          const statusFallbackDurationMs = Math.max(
            MIN_VOICE_DURATION_MS,
            attachmentDurationMs || Math.round(duration * 1000) || fallbackDurationMs
          )
          const reachedEndByTime =
            duration > 0 && currentTime >= Math.max(duration - 0.05, duration * 0.98)
          const reachedTerminalStoppedState =
            !status.playing &&
            (status.didJustFinish || reachedEndByTime || status.playbackState === 'ended')

          if (
            __DEV__ &&
            Platform.OS === 'ios' &&
            (statusSecond !== lastLoggedStatusSecond ||
              statusState !== lastLoggedStatusState ||
              status.didJustFinish ||
              reachedTerminalStoppedState)
          ) {
            lastLoggedStatusSecond = statusSecond
            lastLoggedStatusState = statusState
            logIOSVoiceDebug('playback.status', {
              messageKey,
              playerId: status.id,
              currentTime,
              duration,
              playing: status.playing,
              didJustFinish: status.didJustFinish,
              playbackState: status.playbackState,
              timeControlStatus: status.timeControlStatus,
              reasonForWaitingToPlay: status.reasonForWaitingToPlay,
              isLoaded: status.isLoaded,
              isBuffering: status.isBuffering,
              attachmentDurationMs,
              fallbackDurationMs,
              statusFallbackDurationMs,
              reachedEndByTime,
              reachedTerminalStoppedState
            })
          }

          if (!hasUpdatedFallbackStopFromStatus && (status.playing || currentTime > 0)) {
            hasUpdatedFallbackStopFromStatus = true
            clearAudioPlaybackStopTimer()
            audioPlaybackStopTimerRef.current = setTimeout(
              () => {
                if (audioPlayerRef.current === player) {
                  stopCurrentAudioPlayer()
                }
              },
              Math.max(0, statusFallbackDurationMs - Math.round(currentTime * 1000)) +
                AUDIO_PLAYBACK_FALLBACK_BUFFER_MS
            )
          }

          if (reachedTerminalStoppedState) {
            stopCurrentAudioPlayer()
          }
        })
        logIOSVoiceDebug('playback.play.call', {
          messageKey,
          playbackSource,
          attachmentDurationMs,
          fallbackDurationMs
        })
        player.play()
        return true
      }

      const queuedPlayback = playbackQueueRef.current.then(playRequest, playRequest)
      playbackQueueRef.current = queuedPlayback.then(
        () => undefined,
        () => undefined
      )

      try {
        await queuedPlayback
      } catch (error) {
        logIOSVoiceDebug('playback.error', {
          messageKey,
          error: error instanceof Error ? error.message : String(error)
        })
        stopCurrentAudioPlayer()
        toast.alert(
          translations.playFailedTitle,
          error instanceof Error ? error.message : translations.playFailed
        )
      }

      return true
    },
    [
      clearAudioPlaybackStopTimer,
      playingAudioMessageId,
      stopCurrentAudioPlayer,
      stopAudioPlayback,
      translations.playFailed,
      translations.playFailedTitle,
      translations.unavailable
    ]
  )

  useEffect(() => {
    audioPlaybackStopHandlers.add(stopAudioPlayback)

    return () => {
      audioPlaybackStopHandlers.delete(stopAudioPlayback)
      stopAudioPlayback()
    }
  }, [stopAudioPlayback])

  return {
    playingAudioMessageId,
    playAudioMessage,
    stopAudioPlayback
  }
}
