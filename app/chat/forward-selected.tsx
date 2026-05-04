import { Image } from 'expo-image'
import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { UIKitChatHeaderTitle } from '@/src/NEUIKit/rn'
import {
  conversationStore,
  forwardStore,
  friendStore,
  nimStore,
  teamStore,
  userStore
} from '@/stores'
import { V2NIMConversationType } from '@/utils/nim-sdk'

type SelectedTarget = {
  conversationId: string
  title: string
  subtitle: string
  avatar?: string
}

const ForwardSelectedScreen = observer(() => {
  const selectedTargets = forwardStore.selectedConversationIds
    .map((conversationId) => {
      if (!nimStore.nim) {
        return null
      }

      const conversation = conversationStore.getConversation(conversationId)
      const targetId =
        nimStore.nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)
      const conversationType =
        nimStore.nim.V2NIMConversationIdUtil.parseConversationType(conversationId)
      const team = teamStore.getTeam(targetId)
      const friend = friendStore.friends.get(targetId)

      return {
        conversationId,
        title:
          conversation?.name ||
          team?.name ||
          friend?.alias ||
          friend?.userProfile?.name ||
          userStore.getDisplayName(targetId),
        subtitle:
          conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
            ? `群聊 · ${targetId}`
            : targetId,
        avatar: conversation?.avatar || team?.avatar || friend?.userProfile?.avatar
      } as SelectedTarget
    })
    .filter(Boolean) as SelectedTarget[]

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title="已选择" />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

      <View style={styles.hero}>
        <ThemedText style={styles.heroTitle}>发送给</ThemedText>
        <View style={styles.heroAvatarRow}>
          {selectedTargets.slice(0, 6).map((item) =>
            item.avatar ? (
              <Image
                key={item.conversationId}
                source={item.avatar}
                style={styles.heroAvatar}
                contentFit="cover"
              />
            ) : (
              <View key={item.conversationId} style={styles.heroAvatarFallback}>
                <ThemedText style={styles.heroAvatarText}>
                  {item.title.slice(0, 1).toUpperCase()}
                </ThemedText>
              </View>
            )
          )}
        </View>
      </View>

      <FlatList
        data={selectedTargets}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>暂无已选择会话</ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowMain}>
              {item.avatar ? (
                <Image source={item.avatar} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <ThemedText style={styles.avatarFallbackText}>
                    {item.title.slice(0, 1).toUpperCase()}
                  </ThemedText>
                </View>
              )}
              <View style={styles.meta}>
                <ThemedText numberOfLines={1} style={styles.title}>
                  {item.title}
                </ThemedText>
                <ThemedText numberOfLines={1} style={styles.subtitle}>
                  {item.subtitle}
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => forwardStore.removeConversation(item.conversationId)}
            >
              <ThemedText style={styles.removeButtonText}>移除</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.submitButton} onPress={() => router.back()}>
        <ThemedText style={styles.submitText}>完成</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB'
  },
  hero: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14
  },
  heroTitle: {
    color: '#2D3541',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800'
  },
  heroAvatarRow: {
    flexDirection: 'row',
    gap: 14
  },
  heroAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#D8E0EA'
  },
  heroAvatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700'
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 120
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 64
  },
  emptyText: {
    color: '#97A2B2',
    fontSize: 15
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#D1D5DB'
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700'
  },
  meta: {
    flex: 1,
    marginLeft: 14,
    gap: 4
  },
  title: {
    color: '#2E3541',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700'
  },
  subtitle: {
    color: '#9BA6B5',
    fontSize: 13,
    lineHeight: 18
  },
  removeButton: {
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 14,
    backgroundColor: '#FFF1EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12
  },
  removeButtonText: {
    color: '#FF6C63',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700'
  },
  submitButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30,
    minHeight: 54,
    borderRadius: 20,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800'
  }
})

export default ForwardSelectedScreen
