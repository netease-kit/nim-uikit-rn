import { useNavigation } from '@react-navigation/native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native'

import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitActionCell,
  UIKitInfoRow,
  UIKitProfileHero,
  UIKitRowDivider,
  UIKitSwitchRow,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import { conversationStore, friendStore, imStoreV2Bridge, nimStore, userStore } from '@/stores'
import { getDisplayErrorMessage } from '@/utils/error-message'
import { ensureNetworkAvailable, getNetworkUnavailableMessage } from '@/utils/network'

type FriendCardAIUser = {
  accountId: string
  name?: string
  avatar?: string
}

function getErrorMessage(error: unknown, fallback: string) {
  return getDisplayErrorMessage(error, fallback)
}

const FriendCardScreen = observer(() => {
  const { t } = useAppTranslation()
  const { accountId } = useLocalSearchParams<{ accountId?: string }>()
  const resolvedAccountId = typeof accountId === 'string' ? accountId : ''
  const [postscript] = useState(t('friendCardDefaultPostscript'))
  const [isDeletingFriend, setIsDeletingFriend] = useState(false)
  const [hasDeletedFriend, setHasDeletedFriend] = useState(false)
  const { runWithNavigationLock } = useNavigationLock()
  const navigation = useNavigation()
  const friend = friendStore.friends.get(resolvedAccountId)
  const aiUsers = imStoreV2Bridge.aiUsers as FriendCardAIUser[]
  const aiUser = aiUsers.find((item) => item.accountId === resolvedAccountId)
  const isAIUser = !!aiUser
  const isBlocked = friendStore.blockList.includes(resolvedAccountId)
  const currentAccountId = nimStore.getLoginUser()
  const isSelf = currentAccountId === resolvedAccountId

  useEffect(() => {
    if (!resolvedAccountId || isSelf || isAIUser) {
      return
    }

    userStore.fetchUser(resolvedAccountId).catch(() => undefined)
    friendStore.ensureFriendRelationFresh(resolvedAccountId).catch(() => undefined)
  }, [isAIUser, isSelf, resolvedAccountId])

  useEffect(() => {
    if (!resolvedAccountId || friend || isSelf) {
      return
    }

    imStoreV2Bridge.rootStore?.aiUserStore.getAIUserListActive?.().catch(() => undefined)
  }, [friend, isSelf, resolvedAccountId])

  const profile = isSelf
    ? userStore.selfProfile || userStore.users.get(resolvedAccountId)
    : userStore.users.get(resolvedAccountId) || friend?.userProfile

  const conversationId = nimStore.nim?.V2NIMConversationIdUtil.p2pConversationId(resolvedAccountId)

  const title = useMemo(
    () => friend?.alias || profile?.name || aiUser?.name || resolvedAccountId,
    [aiUser?.name, friend?.alias, profile?.name, resolvedAccountId]
  )

  const detailLines = useMemo(() => {
    const lines: string[] = []
    const nickname = profile?.name || aiUser?.name

    if (nickname && nickname !== title) {
      lines.push(t('commonNicknameText', { name: nickname }))
    }

    lines.push(t('commonAccountText', { account: resolvedAccountId }))
    return lines
  }, [aiUser?.name, profile?.name, resolvedAccountId, t, title])

  const showDeletingState = isDeletingFriend || hasDeletedFriend
  const isFriendCard = (!!friend || showDeletingState) && !isSelf
  const showStrangerHeaderTitle = isFriendCard || isSelf

  const handleDeleteFriend = async () => {
    if (isDeletingFriend) {
      return
    }

    try {
      setIsDeletingFriend(true)
      await ensureNetworkAvailable()
      await friendStore.deleteFriend(resolvedAccountId)
      setHasDeletedFriend(true)
      if (navigation.canGoBack()) {
        router.back()
      } else {
        router.replace('/(tabs)/contacts' as never)
      }
    } catch (error) {
      setIsDeletingFriend(false)
      toast.alert(t('commonDeleteFailed'), getErrorMessage(error, getNetworkUnavailableMessage()))
    }
  }

  const openChat = async () => {
    if (!conversationId) {
      return
    }

    try {
      await conversationStore.createConversation(conversationId)
      runWithNavigationLock(() => {
        router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
      })
    } catch (error) {
      toast.alert(t('commonOpenFailed'), getErrorMessage(error, t('commonRetryLater')))
    }
  }

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{
          title: showStrangerHeaderTitle
            ? isFriendCard
              ? t('friendCardTitle')
              : t('strangerCardTitle')
            : '',
          headerTitleAlign: 'center',
          headerShown: true
        }}
      />

      {showDeletingState ? (
        <View style={styles.pendingState}>
          <ActivityIndicator color="#337EFF" />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <UIKitProfileHero
            account={resolvedAccountId}
            avatar={profile?.avatar || friend?.userProfile?.avatar || aiUser?.avatar}
            title={title || t('commonUnknownAccount')}
            lines={detailLines}
          />

          {friend ? (
            <View style={styles.group}>
              <UIKitInfoRow
                label={t('friendCardAlias')}
                value={friend?.alias || ''}
                valueNumberOfLines={1}
                compact
                showChevron
                onPress={() =>
                  runWithNavigationLock(() => {
                    router.push({
                      pathname: '/friend/edit',
                      params: { accountId: resolvedAccountId }
                    } as never)
                  })
                }
              />
            </View>
          ) : null}

          {friend ? (
            <>
              <View style={styles.group}>
                <UIKitInfoRow
                  label={t('friendCardBirthday')}
                  value={profile?.birthday || t('commonNotSet')}
                  valueNumberOfLines={1}
                  compact
                />
                <UIKitRowDivider />
                <UIKitInfoRow
                  label={t('friendCardMobile')}
                  value={profile?.mobile || t('commonNotSet')}
                  valueNumberOfLines={1}
                  compact
                />
                <UIKitRowDivider />
                <UIKitInfoRow
                  label={t('friendCardEmail')}
                  value={profile?.email || t('commonNotSet')}
                  valueNumberOfLines={1}
                  compact
                />
                <UIKitRowDivider />
                <UIKitInfoRow
                  label={t('friendCardSignature')}
                  value={profile?.sign || t('commonNotSet')}
                  valueNumberOfLines={1}
                  compact
                />
              </View>

              {!isSelf ? (
                <View style={styles.group}>
                  <UIKitSwitchRow
                    label={t('commonAddToBlacklist')}
                    value={isBlocked}
                    onValueChange={async (value: boolean) => {
                      try {
                        await ensureNetworkAvailable()

                        if (value) {
                          await friendStore.addToBlockList(resolvedAccountId)
                        } else {
                          await friendStore.removeFromBlockList(resolvedAccountId)
                        }
                      } catch (error) {
                        toast.alert(
                          t('commonActionFailed'),
                          getErrorMessage(error, getNetworkUnavailableMessage())
                        )
                      }
                    }}
                  />
                </View>
              ) : null}

              {!isSelf ? (
                <View style={styles.group}>
                  <UIKitActionCell label={t('friendCardChat')} onPress={openChat} />
                </View>
              ) : null}

              {!isSelf ? (
                <View style={styles.group}>
                  <UIKitActionCell
                    label={t('friendCardDelete')}
                    tone="danger"
                    onPress={() =>
                      Alert.alert(
                        t('friendCardDelete'),
                        t('friendCardDeleteConfirm', { name: title || resolvedAccountId }),
                        [
                          { text: t('actionCancel'), style: 'cancel' },
                          {
                            text: t('commonDelete'),
                            style: 'destructive',
                            onPress: handleDeleteFriend
                          }
                        ]
                      )
                    }
                  />
                </View>
              ) : null}
            </>
          ) : !isSelf ? (
            <>
              {!isAIUser ? (
                <View style={styles.group}>
                  <UIKitActionCell
                    label={t('friendCardAdd')}
                    tone="primary"
                    onPress={async () => {
                      try {
                        await ensureNetworkAvailable()
                        await friendStore.addFriend(resolvedAccountId, postscript)
                        toast.info(t('friendCardAddSentBody'))
                      } catch (error) {
                        toast.alert(
                          t('commonSendFailed'),
                          getErrorMessage(error, getNetworkUnavailableMessage())
                        )
                      }
                    }}
                  />
                </View>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      )}
    </UIKitWhitePage>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA'
  },
  content: {
    paddingBottom: 16
  },
  group: {
    marginTop: 12,
    backgroundColor: '#FFFFFF'
  },
  pendingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default FriendCardScreen
