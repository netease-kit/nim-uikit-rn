import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  getUIKitAppellation,
  resolveUIKitProfileRoute,
  UIKitInfoRow,
  UIKitPage,
  UIKitRowDivider,
  UIKitSwitchRow,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import { conversationStore, friendStore, imStoreV2Bridge, nimStore } from '@/stores'
import { getDisplayErrorMessage } from '@/utils/error-message'
import { ensureNetworkAvailable, getConfirmedOfflineMessage } from '@/utils/network'

function getConversationForSettings(conversationId: string) {
  return (
    imStoreV2Bridge.getConversation(conversationId) ||
    conversationStore.getConversation(conversationId)
  )
}

function getConversationMutationStore() {
  const preferCloudConversation = !!imStoreV2Bridge.rootStore?.sdkOptions?.enableV2CloudConversation
  const localConversationStore = imStoreV2Bridge.rootStore?.localConversationStore
  const cloudConversationStore = imStoreV2Bridge.rootStore?.conversationStore

  if (preferCloudConversation && cloudConversationStore) {
    return cloudConversationStore
  }

  return localConversationStore || cloudConversationStore || null
}

const P2PSettingsScreen = observer(() => {
  const { t } = useAppTranslation()
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const conversation = getConversationForSettings(resolvedConversationId)
  const targetAccountId =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(resolvedConversationId)
  const friend = targetAccountId ? friendStore.friends.get(targetAccountId) : null
  const { runWithNavigationLock } = useNavigationLock()
  const displayName = targetAccountId
    ? getUIKitAppellation({ account: targetAccountId }) || targetAccountId
    : conversation?.name || t('p2pSettingsTitle')

  const handleOpenProfileCard = async () => {
    if (!targetAccountId) {
      return
    }

    const pathname = await resolveUIKitProfileRoute(targetAccountId)
    runWithNavigationLock(() => {
      router.push({
        pathname,
        params: { accountId: targetAccountId }
      } as never)
    })
  }

  const handleToggleMute = async (value: boolean) => {
    try {
      await ensureNetworkAvailable()
      await conversationStore.toggleMute(resolvedConversationId, !value)
      await imStoreV2Bridge.refreshCurrentConversationSource()
    } catch (error) {
      const offlineMessage = await getConfirmedOfflineMessage()
      toast.alert(
        t('settingsUpdateFailed'),
        offlineMessage || getDisplayErrorMessage(error, t('commonRetryLater'))
      )
    }
  }

  const handleToggleStickTop = async (value: boolean) => {
    try {
      await ensureNetworkAvailable()
      const conversationMutationStore = getConversationMutationStore()

      if (conversationMutationStore) {
        await imStoreV2Bridge.stickTopActiveConversation(resolvedConversationId, value)
        return
      }

      await conversationStore.toggleStickTop(resolvedConversationId, value)
    } catch (error) {
      const offlineMessage = await getConfirmedOfflineMessage()
      toast.alert(
        t('settingsUpdateFailed'),
        offlineMessage || getDisplayErrorMessage(error, t('commonRetryLater'))
      )
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: t('p2pSettingsTitle'), headerTitleAlign: 'center' }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCardContent}>
          <Pressable style={styles.peerItem} onPress={handleOpenProfileCard}>
            <UIKitUserAvatar
              account={targetAccountId || displayName}
              avatar={friend?.userProfile?.avatar || conversation?.avatar}
              size={38}
            />
            <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.displayName}>
              {displayName}
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.addButton}
            onPress={() =>
              runWithNavigationLock(() => {
                router.push({
                  pathname: '/conversation/picker',
                  params: { seedAccountId: targetAccountId || '' }
                } as never)
              })
            }
          >
            <View style={styles.memberAddCircle}>
              <ThemedText style={styles.memberAddText}>+</ThemedText>
            </View>
            <View style={styles.memberAddNameSpacer} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <UIKitInfoRow
            label={t('commonMessageMark')}
            value=""
            showChevron
            onPress={() =>
              runWithNavigationLock(() => {
                router.push({
                  pathname: '/chat/pins',
                  params: { conversationId: resolvedConversationId }
                } as never)
              })
            }
          />
          <UIKitRowDivider />
          <UIKitSwitchRow
            label={t('commonEnableMessageNotification')}
            value={!conversation?.mute}
            onValueChange={handleToggleMute}
          />
          <UIKitRowDivider />
          <UIKitSwitchRow
            label={t('commonChatStickTop')}
            value={!!conversation?.stickTop}
            onValueChange={handleToggleStickTop}
          />
        </View>
      </ScrollView>
    </UIKitPage>
  )
})

const styles = StyleSheet.create({
  page: {
    flex: 1
  },
  content: {
    padding: 16,
    gap: 16
  },
  heroCardContent: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  peerItem: {
    width: 64,
    alignItems: 'center',
    gap: 6
  },
  displayName: {
    color: '#333333',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    width: '100%'
  },
  addButton: {
    width: 56,
    alignItems: 'center',
    gap: 6
  },
  memberAddCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  memberAddText: {
    color: '#98A1AD',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '400'
  },
  memberAddNameSpacer: {
    width: '100%',
    height: 18
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  }
})

export default P2PSettingsScreen
