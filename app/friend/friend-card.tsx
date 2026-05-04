import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

import {
  UIKitActionCell,
  UIKitInfoRow,
  UIKitProfileHero,
  UIKitRowDivider,
  UIKitSwitchRow,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import { conversationStore, friendStore, nimStore, userStore } from '@/stores'

const FriendCardScreen = observer(() => {
  const { accountId } = useLocalSearchParams<{ accountId?: string }>()
  const resolvedAccountId = typeof accountId === 'string' ? accountId : ''
  const [postscript] = useState('你好，我是 RN Demo 用户')
  const [savingMute, setSavingMute] = useState(false)
  const friend = friendStore.friends.get(resolvedAccountId)
  const isBlocked = friendStore.blockList.includes(resolvedAccountId)
  const currentAccountId = nimStore.getLoginUser()
  const isSelf = currentAccountId === resolvedAccountId

  useEffect(() => {
    if (!resolvedAccountId || isSelf) {
      return
    }

    userStore.fetchUser(resolvedAccountId).catch(() => undefined)
  }, [isSelf, resolvedAccountId])

  const profile = isSelf
    ? userStore.selfProfile || userStore.users.get(resolvedAccountId)
    : userStore.users.get(resolvedAccountId) || friend?.userProfile

  const conversationId = nimStore.nim?.V2NIMConversationIdUtil.p2pConversationId(resolvedAccountId)
  const conversation = conversationId ? conversationStore.getConversation(conversationId) : null
  const muteEnabled = !!conversation?.mute

  const title = useMemo(
    () => friend?.alias || profile?.name || resolvedAccountId,
    [friend?.alias, profile?.name, resolvedAccountId]
  )

  const detailLines = useMemo(() => {
    const lines: string[] = []

    if (profile?.name && profile.name !== title) {
      lines.push(`昵称:${profile.name}`)
    }

    lines.push(`账号:${resolvedAccountId}`)
    return lines
  }, [profile?.name, resolvedAccountId, title])

  const openChat = async () => {
    if (!conversationId) {
      return
    }

    try {
      await conversationStore.createConversation(conversationId)
      router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
    } catch (error) {
      Alert.alert('打开失败', error instanceof Error ? error.message : '请稍后重试')
    }
  }

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{
          title: friend ? '好友名片' : '陌生人名片',
          headerTitleAlign: 'center',
          headerShown: true
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <UIKitProfileHero
          account={resolvedAccountId}
          avatar={profile?.avatar || friend?.userProfile?.avatar}
          title={title || '未知账号'}
          lines={detailLines}
        />

        <View style={styles.group}>
          <UIKitInfoRow
            label="备注名"
            value={friend?.alias || ''}
            showChevron={!!friend}
            onPress={
              friend
                ? () =>
                    router.push({
                      pathname: '/friend/edit',
                      params: { accountId: resolvedAccountId }
                    } as never)
                : undefined
            }
          />
        </View>

        {friend ? (
          <>
            <View style={styles.group}>
              <UIKitInfoRow label="生日" value={profile?.birthday || '未设置'} />
              <UIKitRowDivider />
              <UIKitInfoRow label="手机" value={profile?.mobile || '未设置'} />
              <UIKitRowDivider />
              <UIKitInfoRow label="邮箱" value={profile?.email || '未设置'} />
              <UIKitRowDivider />
              <UIKitInfoRow label="个性签名" value={profile?.sign || '未设置'} />
            </View>

            {!isSelf ? (
              <View style={styles.group}>
                <UIKitSwitchRow
                  label="消息提醒"
                  value={!muteEnabled}
                  onValueChange={async (value: boolean) => {
                    if (!conversationId || savingMute) {
                      return
                    }

                    try {
                      setSavingMute(true)
                      await conversationStore.toggleMute(conversationId, !value)
                    } catch (error) {
                      Alert.alert('设置失败', error instanceof Error ? error.message : '请稍后重试')
                    } finally {
                      setSavingMute(false)
                    }
                  }}
                />
                <UIKitRowDivider />
                <UIKitSwitchRow
                  label="加入黑名单"
                  value={isBlocked}
                  onValueChange={async (value: boolean) => {
                    try {
                      if (value) {
                        await friendStore.addToBlockList(resolvedAccountId)
                      } else {
                        await friendStore.removeFromBlockList(resolvedAccountId)
                      }
                    } catch (error) {
                      Alert.alert('操作失败', error instanceof Error ? error.message : '请稍后重试')
                    }
                  }}
                />
              </View>
            ) : null}

            {!isSelf ? (
              <View style={styles.group}>
                <UIKitActionCell label="聊天" onPress={openChat} />
              </View>
            ) : null}

            {!isSelf ? (
              <View style={styles.group}>
                <UIKitActionCell
                  label="删除好友"
                  tone="danger"
                  onPress={() =>
                    Alert.alert('删除好友', '确认删除当前好友？', [
                      { text: '取消', style: 'cancel' },
                      {
                        text: '删除',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await friendStore.deleteFriend(resolvedAccountId)
                            router.back()
                          } catch (error) {
                            Alert.alert(
                              '删除失败',
                              error instanceof Error ? error.message : '请稍后重试'
                            )
                          }
                        }
                      }
                    ])
                  }
                />
              </View>
            ) : null}
          </>
        ) : !isSelf ? (
          <>
            <View style={styles.group}>
              <UIKitSwitchRow
                label="加入黑名单"
                value={isBlocked}
                onValueChange={async (value: boolean) => {
                  try {
                    if (value) {
                      await friendStore.addToBlockList(resolvedAccountId)
                    } else {
                      await friendStore.removeFromBlockList(resolvedAccountId)
                    }
                  } catch (error) {
                    Alert.alert('操作失败', error instanceof Error ? error.message : '请稍后重试')
                  }
                }}
              />
            </View>

            <View style={styles.group}>
              <UIKitActionCell
                label="添加好友"
                tone="primary"
                onPress={async () => {
                  try {
                    await friendStore.addFriend(resolvedAccountId, postscript)
                    Alert.alert('已发送', '好友申请已发送')
                  } catch (error) {
                    Alert.alert('发送失败', error instanceof Error ? error.message : '请稍后重试')
                  }
                }}
              />
            </View>
          </>
        ) : null}
      </ScrollView>
    </UIKitWhitePage>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA'
  },
  content: {
    paddingBottom: 24
  },
  group: {
    marginTop: 16,
    backgroundColor: '#FFFFFF'
  }
})

export default FriendCardScreen
