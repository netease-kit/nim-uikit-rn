import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import {
  getUIKitAppellation,
  UIKitIcon,
  UIKitInfoRow,
  UIKitPage,
  UIKitRowDivider,
  UIKitSwitchRow,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import { conversationStore, friendStore, nimStore } from '@/stores'

const P2PSettingsScreen = observer(() => {
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const conversation = conversationStore.getConversation(resolvedConversationId)
  const targetAccountId =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(resolvedConversationId)
  const friend = targetAccountId ? friendStore.friends.get(targetAccountId) : null
  const displayName = targetAccountId
    ? getUIKitAppellation({ account: targetAccountId }) || targetAccountId
    : conversation?.name || '聊天设置'
  const isBlocked = !!targetAccountId && friendStore.blockList.includes(targetAccountId)

  const handleToggleMute = async (value: boolean) => {
    try {
      await conversationStore.toggleMute(resolvedConversationId, !value)
    } catch (error) {
      Alert.alert('设置失败', error instanceof Error ? error.message : '请稍后重试')
    }
  }

  const handleToggleStickTop = async (value: boolean) => {
    try {
      await conversationStore.toggleStickTop(resolvedConversationId, value)
    } catch (error) {
      Alert.alert('设置失败', error instanceof Error ? error.message : '请稍后重试')
    }
  }

  const handleToggleBlock = async (value: boolean) => {
    if (!targetAccountId) {
      return
    }

    try {
      if (value) {
        await friendStore.addToBlockList(targetAccountId)
      } else {
        await friendStore.removeFromBlockList(targetAccountId)
      }
    } catch (error) {
      Alert.alert('设置失败', error instanceof Error ? error.message : '请稍后重试')
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: '聊天设置', headerTitleAlign: 'center' }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCardContent}>
          <UIKitUserAvatar
            account={targetAccountId || displayName}
            avatar={friend?.userProfile?.avatar || conversation?.avatar}
            size={64}
          />
          <View style={styles.heroMeta}>
            <ThemedText style={styles.displayName}>{displayName}</ThemedText>
            <ThemedText style={styles.accountText}>
              账号：{targetAccountId || conversation?.name || '-'}
            </ThemedText>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: '/conversation/picker',
                params: { seedAccountId: targetAccountId || '' }
              } as never)
            }
          >
            <UIKitIcon type="icon-tianjiahaoyou" size={22} tintColor="#B7C0CC" />
          </Pressable>
        </View>

        <View style={styles.card}>
          <UIKitInfoRow
            label="标记"
            value=""
            showChevron
            onPress={() =>
              router.push({
                pathname: '/chat/pins',
                params: { conversationId: resolvedConversationId }
              } as never)
            }
          />
          <UIKitRowDivider />
          <UIKitSwitchRow
            label="开启消息提醒"
            value={!conversation?.mute}
            onValueChange={handleToggleMute}
          />
          <UIKitRowDivider />
          <UIKitSwitchRow
            label="聊天置顶"
            value={!!conversation?.stickTop}
            onValueChange={handleToggleStickTop}
          />
          {targetAccountId ? (
            <>
              <UIKitRowDivider />
              <UIKitSwitchRow
                label="加入黑名单"
                value={isBlocked}
                onValueChange={handleToggleBlock}
              />
            </>
          ) : null}
        </View>

        <View style={styles.card}>
          <UIKitInfoRow
            label="历史记录"
            value=""
            showChevron
            onPress={() =>
              router.push({
                pathname: '/chat/history',
                params: {
                  conversationId: resolvedConversationId,
                  title: displayName
                }
              } as never)
            }
          />
          {targetAccountId ? (
            <>
              <UIKitRowDivider />
              <UIKitInfoRow
                label="查看好友名片"
                value=""
                showChevron
                onPress={() =>
                  router.push({
                    pathname: '/friend/friend-card',
                    params: { accountId: targetAccountId }
                  } as never)
                }
              />
            </>
          ) : null}
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
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  heroMeta: {
    flex: 1
  },
  displayName: {
    color: '#333333',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600'
  },
  accountText: {
    marginTop: 8,
    color: '#98A1AD',
    fontSize: 15,
    lineHeight: 22
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#D0D8E4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  }
})

export default P2PSettingsScreen
