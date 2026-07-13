import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useFileMessageOpener } from '@/hooks/useFileMessageOpener'
import {
  stopAllMessageAudioPlayback,
  useMessageAudioPlayback
} from '@/hooks/useMessageAudioPlayback'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitChatEmptyState, UIKitChatHeaderTitle, UIKitChatMessageBubble } from '@/src/NEUIKit/rn'
import { imStoreV2Bridge, messageStore, nimStore, teamStore, userStore } from '@/stores'
import { getFileTransferSource } from '@/utils/media-source'
import { getMessageKey, isMergedForwardMessage } from '@/utils/messageForward'
import {
  V2NIMConversationType,
  V2NIMMessage,
  V2NIMMessageFileAttachment,
  V2NIMMessageType
} from '@/utils/nim-sdk'

const SOURCE_MESSAGE_CURRENT_USER_ID = '__source_message_detail__'

function getSelfSourceMessageSenderName(accountId: string, teamId?: string) {
  const teamNick = teamId
    ? teamStore
        .getMembers(teamId)
        .find((item) => item.accountId === accountId)
        ?.teamNick?.trim()
    : ''
  const localUserName = userStore.users.get(accountId)?.name?.trim()
  const selfProfileName =
    userStore.selfProfile?.accountId === accountId ? userStore.selfProfile.name?.trim() : ''
  const imUserName = imStoreV2Bridge.rootStore?.userStore.users.get(accountId)?.name?.trim()

  return teamNick || localUserName || selfProfileName || imUserName || accountId
}

const SourceMessageScreen = observer(() => {
  const { t } = useAppTranslation()
  const { conversationId, messageId } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
  }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const resolvedMessageId = typeof messageId === 'string' ? messageId : ''
  const message = messageStore.getMessageById(resolvedConversationId, resolvedMessageId)
  const currentUserId = nimStore.getLoginUser()
  const conversationType =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(resolvedConversationId)
  const targetId =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(resolvedConversationId)
  const selfSenderName =
    message?.senderId && message.senderId === currentUserId
      ? getSelfSourceMessageSenderName(
          message.senderId,
          conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
            ? targetId
            : undefined
        )
      : undefined
  const { playingAudioMessageId, playAudioMessage } = useMessageAudioPlayback({
    playFailedTitle: t('chatAudioPlayFailedTitle'),
    unavailable: t('chatAudioUnavailable'),
    playFailed: t('chatAudioPlayFailed')
  })
  const { downloadingFileIds, downloadedFileMap, fileDownloadProgressMap, openFileMessage } =
    useFileMessageOpener()

  const openSourceMessageDetail = (sourceMessage: V2NIMMessage) => {
    router.push({
      pathname: '/chat/source-message',
      params: {
        conversationId: sourceMessage.conversationId,
        messageId: getMessageKey(sourceMessage)
      }
    } as never)
  }

  const openSourceMessage = async (sourceMessage: V2NIMMessage) => {
    if (isMergedForwardMessage(sourceMessage)) {
      router.push({
        pathname: '/chat/merged-forward-detail',
        params: {
          conversationId: sourceMessage.conversationId,
          messageId: getMessageKey(sourceMessage)
        }
      } as never)
      return
    }

    if (
      sourceMessage.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
      sourceMessage.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO
    ) {
      stopAllMessageAudioPlayback()
      router.push({
        pathname: '/chat/media-viewer',
        params: {
          conversationId: sourceMessage.conversationId,
          messageId: getMessageKey(sourceMessage),
          single: '1',
          type:
            sourceMessage.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE
              ? 'image'
              : 'video'
        }
      } as never)
      return
    }

    if (sourceMessage.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
      router.push({
        pathname: '/chat/location-detail',
        params: {
          conversationId: sourceMessage.conversationId,
          messageId: getMessageKey(sourceMessage)
        }
      } as never)
      return
    }

    if (sourceMessage.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
      const messageKey = getMessageKey(sourceMessage)
      const attachment = sourceMessage.attachment as V2NIMMessageFileAttachment | undefined
      const source = getFileTransferSource(attachment)
      const downloadedUri = downloadedFileMap[messageKey]
      const isRemoteSource =
        !!source && !source.startsWith('file://') && !source.startsWith('content://')

      if (isRemoteSource && !downloadedUri && !downloadingFileIds.includes(messageKey)) {
        toast.alert(t('chatReplySourceDownloading'))
      }

      await openFileMessage(sourceMessage)
      return
    }

    if (sourceMessage.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) {
      await playAudioMessage(sourceMessage)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title={t('chatSourceMessageTitle')} />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F3F6FB' }
        }}
      />

      {!message ? (
        <UIKitChatEmptyState
          title={t('messagePreviewMissingTitle' as never)}
          description={t('messagePreviewMissingDescription' as never)}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.messageWrap}>
            <UIKitChatMessageBubble
              message={message}
              currentUserId={SOURCE_MESSAGE_CURRENT_USER_ID}
              conversationId={resolvedConversationId}
              conversationType={conversationType}
              targetId={targetId}
              senderNameOverride={selfSenderName}
              onLongPress={() => undefined}
              onPressMessage={(sourceMessage) => {
                openSourceMessage(sourceMessage).catch((error) => {
                  toast.alert(
                    t('mediaViewerOpenFailedTitle'),
                    error instanceof Error ? error.message : t('chatOpenMessageFailed')
                  )
                })
              }}
              onPressReplyMessage={openSourceMessageDetail}
              onReeditMessage={() => undefined}
              reeditHidden
              onRetry={() => undefined}
              hideReplyPreview
              downloadingVideoIds={[]}
              downloadedVideoMap={{}}
              downloadingFileIds={downloadingFileIds}
              downloadedFileMap={downloadedFileMap}
              fileDownloadProgressMap={fileDownloadProgressMap}
              playingAudioMessageId={playingAudioMessageId}
              selectionMode={false}
              selected={false}
              selectable={false}
              onToggleSelect={() => undefined}
              showReadReceipt={false}
            />
          </View>
        </ScrollView>
      )}
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF'
  },
  messageWrap: {
    width: '100%'
  }
})

export default SourceMessageScreen
