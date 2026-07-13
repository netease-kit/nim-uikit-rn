import { Image } from 'expo-image'
import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import {
  getUIKitAppellation,
  getUIKitAvatarUri,
  getUIKitUserAvatarLabel,
  UIKitChatHeaderTitle,
  UIKitIcon
} from '@/src/NEUIKit/rn'
import { conversationStore, forwardStore, friendStore, nimStore, teamStore } from '@/stores'
import { V2NIMConversationType } from '@/utils/nim-sdk'

type SelectedTarget = {
  conversationId: string
  title: string
  avatar?: string
  targetId: string
  conversationType: V2NIMConversationType
  memberCount?: number
}

const FORWARD_SELECTED_INITIAL_RENDER_COUNT = 10
const FORWARD_SELECTED_BATCH_RENDER_COUNT = 8
const FORWARD_SELECTED_WINDOW_SIZE = 8

function getSelectedTitle(
  targetId: string,
  conversationType: V2NIMConversationType,
  fallbackName?: string
) {
  if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
    return fallbackName || targetId
  }

  return getUIKitAppellation({ account: targetId }) || fallbackName || targetId
}

function getSelectedAvatar(
  targetId: string,
  conversationType: V2NIMConversationType,
  explicitAvatar?: string
) {
  if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
    return explicitAvatar || ''
  }

  return getUIKitAvatarUri(targetId, explicitAvatar)
}

function getSelectedAvatarLabel(item: SelectedTarget) {
  if (item.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
    return item.title.slice(0, 1).toUpperCase()
  }

  return getUIKitUserAvatarLabel({ account: item.targetId }).toUpperCase()
}

const ForwardSelectedScreen = observer(() => {
  const { t } = useAppTranslation()
  const insets = useSafeAreaInsets()
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
        targetId,
        conversationType,
        title: getSelectedTitle(
          targetId,
          conversationType,
          conversation?.name || team?.name || friend?.userProfile?.name
        ),
        avatar: getSelectedAvatar(
          targetId,
          conversationType,
          conversation?.avatar || team?.avatar || friend?.userProfile?.avatar
        ),
        memberCount:
          conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
            ? team?.memberCount || teamStore.getMembers(targetId).length || 0
            : undefined
      } as SelectedTarget
    })
    .filter(Boolean) as SelectedTarget[]

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title={t('forwardSelectedTitle')} />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
              <ThemedText style={styles.headerCancelText}>{t('actionCancel')}</ThemedText>
            </TouchableOpacity>
          )
        }}
      />

      <FlatList
        data={selectedTargets}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 20, 120) }
        ]}
        removeClippedSubviews
        initialNumToRender={FORWARD_SELECTED_INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={FORWARD_SELECTED_BATCH_RENDER_COUNT}
        windowSize={FORWARD_SELECTED_WINDOW_SIZE}
        updateCellsBatchingPeriod={16}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>{t('forwardSelectedEmpty')}</ThemedText>
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
                    {getSelectedAvatarLabel(item)}
                  </ThemedText>
                </View>
              )}
              <View style={styles.meta}>
                {item.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ? (
                  <View style={styles.titleRow}>
                    <ThemedText numberOfLines={1} style={styles.title}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={styles.memberCountText}>
                      ({item.memberCount || 0})
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText numberOfLines={1} style={styles.title}>
                    {item.title}
                  </ThemedText>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => forwardStore.removeConversation(item.conversationId)}
            >
              <UIKitIcon type="icon-guanbi" size={14} tintColor="#B4BCC7" />
            </TouchableOpacity>
          </View>
        )}
      />
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  headerCancelText: {
    color: '#337EFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600'
  },
  listContent: {
    paddingHorizontal: 16,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECF1'
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1D5DB'
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  meta: {
    flex: 1,
    marginLeft: 12
  },
  title: {
    flexShrink: 1,
    color: '#2E3541',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0
  },
  memberCountText: {
    flexShrink: 0,
    color: '#2E3541',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700'
  },
  removeButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4
  }
})

export default ForwardSelectedScreen
