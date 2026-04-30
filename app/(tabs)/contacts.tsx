import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { Pressable, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { friendGroupByPy } from '@/src/NEUIKit/common/utils/friend'
import {
  UIKitEmptyState,
  UIKitIcon,
  UIKitListRow,
  UIKitUserAvatar,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import { friendStore, imStoreV2Bridge, teamStore, userStore } from '@/stores'
import type { V2NIMFriend } from '@/utils/nim-sdk'

type FriendDirectoryItem = {
  accountId: string
  appellation: string
  avatar?: string
}

type FriendDirectorySection = {
  key: string
  title: string
  data: FriendDirectoryItem[]
}

const shortcuts = [
  {
    key: 'validlist',
    label: '验证消息',
    icon: 'icon-yanzheng',
    color: '#60CFA7',
    route: '/contacts/validlist'
  },
  {
    key: 'blacklist',
    label: '黑名单',
    icon: 'icon-lahei2',
    color: '#53C3F4',
    route: '/contacts/blacklist'
  },
  {
    key: 'teamlist',
    label: '我的群聊',
    icon: 'icon-team2',
    color: '#BE65D9',
    route: '/contacts/teamlist'
  }
] as const

const ContactsScreen = observer(() => {
  const listRef = useRef<SectionList<FriendDirectoryItem, FriendDirectorySection>>(null)
  const friendList = imStoreV2Bridge.friends.length
    ? imStoreV2Bridge.friends
    : friendStore.friendList
  const visibleFriends = (friendList as V2NIMFriend[]).filter(
    (item) => !friendStore.blockList.includes(item.accountId)
  )
  const friendSections: FriendDirectorySection[] = friendGroupByPy(
    visibleFriends
      .map((item) => {
        const nickname =
          item.userProfile?.name ||
          (userStore.selfProfile?.accountId === item.accountId
            ? userStore.selfProfile.name
            : userStore.users.get(item.accountId)?.name) ||
          ''
        const alias = item.alias?.trim() || ''
        const appellation = nickname || alias || '未知好友'

        return {
          accountId: item.accountId,
          appellation,
          avatar: item.userProfile?.avatar
        }
      })
      .sort((left, right) =>
        left.appellation.localeCompare(right.appellation, 'zh-Hans-CN', {
          sensitivity: 'base'
        })
      ),
    {
      firstKey: 'appellation',
      secondKey: 'accountId'
    },
    false
  ).map((section) => ({
    key: section.key,
    title: section.key,
    data: section.data
  }))
  const sectionIndex = friendSections.map((section) => section.title)

  return (
    <UIKitWhitePage>
      <Stack.Screen
        options={{
          headerTitle: () => <ThemedHeaderTitle title="通讯录" />,
          headerTitleAlign: 'left',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push('/conversation/search' as never)}
              >
                <UIKitIcon type="icon-sousuo" size={24} tintColor="#6E7580" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push('/friend/add' as never)}
              >
                <UIKitIcon type="icon-tianjiaanniu" size={28} tintColor="#6E7580" />
              </TouchableOpacity>
            </View>
          )
        }}
      />

      {shortcuts.map((item) => (
        <UIKitListRow
          key={item.key}
          title={item.label}
          icon={item.icon}
          iconColor={item.color}
          badge={item.key === 'validlist' ? friendStore.unreadApplicationCount : undefined}
          titleStyle={styles.shortcutTitle}
          onPress={() => router.push(item.route as never)}
        />
      ))}

      <View style={styles.summaryStrip}>
        <ThemedText style={styles.summaryText}>
          好友 {visibleFriends.length} 位 · 群 {teamStore.teamList.length} 个
        </ThemedText>
      </View>

      <View style={styles.friendListWrap}>
        <SectionList
          ref={listRef}
          sections={friendSections}
          keyExtractor={(item) => item.accountId}
          ListEmptyComponent={
            <UIKitEmptyState title="暂无联系人" subtitle="从右上角“添加好友”开始搜索账号。" />
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionHeaderText}>{section.title}</ThemedText>
            </View>
          )}
          renderItem={({ item, index, section }) => {
            const isLast = index === section.data.length - 1

            return (
              <Pressable
                style={styles.friendRow}
                onPress={() =>
                  router.push({
                    pathname: '/friend/friend-card',
                    params: { accountId: item.accountId }
                  } as never)
                }
              >
                <View style={styles.friendAvatarWrap}>
                  <UIKitUserAvatar account={item.accountId} avatar={item.avatar} size={56} />
                </View>
                <View style={[styles.friendBody, !isLast && styles.friendBodyBorder]}>
                  <ThemedText numberOfLines={1} style={styles.friendName}>
                    {item.appellation}
                  </ThemedText>
                </View>
              </Pressable>
            )
          }}
          contentContainerStyle={styles.friendListContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />

        {sectionIndex.length ? (
          <View style={styles.alphaRail}>
            {sectionIndex.map((letter, index) => (
              <Pressable
                key={`${letter}-${index}`}
                style={styles.alphaRailButton}
                onPress={() =>
                  listRef.current?.scrollToLocation({
                    sectionIndex: index,
                    itemIndex: 0,
                    animated: true,
                    viewOffset: 0
                  })
                }
              >
                <ThemedText
                  style={[styles.alphaRailText, index === 0 && styles.alphaRailTextActive]}
                >
                  {letter}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </UIKitWhitePage>
  )
})

const styles = StyleSheet.create({
  headerTitleText: {
    color: '#222222',
    fontSize: 22,
    fontWeight: '700'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8
  },
  headerButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  shortcutTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#333333'
  },
  summaryStrip: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F5F6FA'
  },
  summaryText: {
    color: '#B3BAC5',
    fontSize: 17
  },
  friendListWrap: {
    flex: 1
  },
  friendListContent: {
    paddingBottom: 24
  },
  sectionHeader: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F5F6FA'
  },
  sectionHeaderText: {
    color: '#B3BAC5',
    fontSize: 17
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    backgroundColor: '#FFFFFF'
  },
  friendAvatarWrap: {
    paddingVertical: 12,
    paddingRight: 16
  },
  friendBody: {
    flex: 1,
    minHeight: 80,
    justifyContent: 'center',
    paddingRight: 28
  },
  friendBodyBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7'
  },
  friendName: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24
  },
  friendSubtitle: {
    marginTop: 2,
    color: '#A6AFBB',
    fontSize: 14,
    lineHeight: 20
  },
  alphaRail: {
    position: 'absolute',
    top: 8,
    right: 6,
    bottom: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: 24
  },
  alphaRailButton: {
    width: 24,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  alphaRailText: {
    color: '#69707D',
    fontSize: 12,
    lineHeight: 16
  },
  alphaRailTextActive: {
    color: '#337EFF',
    fontWeight: '700'
  }
})

function ThemedHeaderTitle({ title }: { title: string }) {
  return <ThemedText style={styles.headerTitleText}>{title}</ThemedText>
}

export default ContactsScreen
