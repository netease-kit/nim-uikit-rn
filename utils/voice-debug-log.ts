import * as FileSystem from 'expo-file-system/legacy'
import { Platform } from 'react-native'

const VOICE_DEBUG_TAG = '[ChatVoiceDebug]'
const VOICE_DEBUG_LOG_FILE_NAME = 'chat-voice-debug.log'
const MAX_LOG_FILE_SIZE = 1024 * 1024
const KEEP_LOG_TAIL_LENGTH = 512 * 1024

const voiceDebugLogUri = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}${VOICE_DEBUG_LOG_FILE_NAME}`
  : null

let writeQueue = Promise.resolve()

function normalizePayload(payload?: Record<string, unknown>) {
  if (!payload) {
    return undefined
  }

  try {
    return JSON.parse(JSON.stringify(payload))
  } catch {
    return payload
  }
}

async function trimLogFileIfNeeded() {
  if (!voiceDebugLogUri) {
    return
  }

  const info = await FileSystem.getInfoAsync(voiceDebugLogUri)

  if (!info.exists || typeof info.size !== 'number' || info.size <= MAX_LOG_FILE_SIZE) {
    return
  }

  const content = await FileSystem.readAsStringAsync(voiceDebugLogUri)
  await FileSystem.writeAsStringAsync(voiceDebugLogUri, content.slice(-KEEP_LOG_TAIL_LENGTH))
}

async function appendVoiceDebugLogLine(line: string) {
  if (!voiceDebugLogUri) {
    return
  }

  await trimLogFileIfNeeded()

  const existingInfo = await FileSystem.getInfoAsync(voiceDebugLogUri)
  const existingContent = existingInfo.exists
    ? await FileSystem.readAsStringAsync(voiceDebugLogUri)
    : ''

  await FileSystem.writeAsStringAsync(voiceDebugLogUri, `${existingContent}${line}\n`)
}

export function logIOSVoiceDebug(event: string, payload?: Record<string, unknown>) {
  if (!__DEV__ || Platform.OS !== 'ios') {
    return
  }

  const normalizedPayload = normalizePayload(payload)
  console.info(`${VOICE_DEBUG_TAG} ${event}`, normalizedPayload)

  const line = JSON.stringify({
    tag: VOICE_DEBUG_TAG,
    event,
    time: new Date().toISOString(),
    uptimeMs: Date.now(),
    payload: normalizedPayload
  })

  writeQueue = writeQueue
    .then(() => appendVoiceDebugLogLine(line))
    .catch((error) => {
      console.warn(`${VOICE_DEBUG_TAG} persist.failed`, {
        event,
        error: error instanceof Error ? error.message : String(error)
      })
    })
}

export function getIOSVoiceDebugLogUri() {
  return voiceDebugLogUri
}
