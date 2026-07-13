import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Pressable,
  SectionList,
  SectionListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewToken
} from 'react-native'
import Animated, {
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import {
  getUIKitOnlineStatusText,
  UIKitEmptyState,
  UIKitIcon,
  UIKitUserAvatar,
  UIKitWhitePage,
  useUIKitUserStatusSubscription
} from '@/src/NEUIKit/rn'
import { friendStore } from '@/stores'
import type { FriendDirectoryItem, FriendDirectorySection } from '@/stores/FriendStore'

type ShortcutItem = (typeof shortcuts)[number]

type ShortcutRowProps = {
  item: ShortcutItem
  index: number
  unreadCount: number
  label: string
  onPress: (route: string) => void
}

type FriendRowProps = {
  item: FriendDirectoryItem
  isLast: boolean
  onPress: (accountId: string) => void
}

const CONTACT_FRIEND_ROW_HEIGHT = 64
const CONTACT_SECTION_HEADER_HEIGHT = 38
const CONTACT_LIST_INITIAL_RENDER_COUNT = 16
const CONTACT_LIST_BATCH_RENDER_COUNT = 12
const CONTACT_LIST_WINDOW_SIZE = 10
const CONTACT_INITIAL_STATUS_SUBSCRIBE_COUNT = CONTACT_LIST_INITIAL_RENDER_COUNT
const CONTACT_STATUS_VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 20
} as const
const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList<FriendDirectoryItem, FriendDirectorySection>
)

type AlphaRailLetterProps = {
  activeSectionIndex: SharedValue<number>
  index: number
  letter: string
  onPress: () => void
}

const shortcuts = [
  {
    key: 'validlist',
    labelKey: 'validMsgText',
    icon: 'icon-contact-verify-msg',
    route: '/contacts/validlist'
  },
  {
    key: 'blacklist',
    labelKey: 'blacklistText',
    icon: 'icon-contact-black-list',
    route: '/contacts/blacklist'
  },
  {
    key: 'teamlist',
    labelKey: 'contactsTeamListTitle',
    icon: 'icon-contact-my-group',
    route: '/contacts/teamlist'
  },
  {
    key: 'ai-users',
    labelKey: 'contactsAiUsersTitle',
    icon: 'icon-contact-ai-user',
    route: '/contacts/ai-users'
  }
] as const

const ShortcutRow = React.memo(function ShortcutRow({
  item,
  index,
  unreadCount,
  label,
  onPress
}: ShortcutRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.shortcutRow, pressed && styles.shortcutRowPressed]}
      onPress={() => onPress(item.route)}
    >
      <View style={styles.shortcutIconWrap}>
        <UIKitIcon type={item.icon} size={36} />
      </View>
      <View style={styles.shortcutBody}>
        <ThemedText style={styles.shortcutTitle}>{label}</ThemedText>
      </View>
      {item.key === 'validlist' && unreadCount > 0 ? (
        <View style={styles.shortcutBadge}>
          <ThemedText style={styles.shortcutBadgeText}>
            {unreadCount > 99 ? '99+' : String(unreadCount)}
          </ThemedText>
        </View>
      ) : null}
      <UIKitIcon type="icon-jiantou" size={18} />
      {index < shortcuts.length - 1 ? <View style={styles.shortcutDivider} /> : null}
    </Pressable>
  )
})

const FriendRow = observer(function FriendRow({ item, isLast, onPress }: FriendRowProps) {
  const onlineStatus = getUIKitOnlineStatusText(item.accountId)

  return (
    <Pressable style={styles.friendRow} onPress={() => onPress(item.accountId)}>
      <View style={styles.friendAvatarWrap}>
        <UIKitUserAvatar
          account={item.accountId}
          avatar={item.avatar}
          size={42}
          onlineStatus={onlineStatus}
        />
      </View>
      <View style={[styles.friendBody, !isLast && styles.friendBodyBorder]}>
        <ThemedText numberOfLines={1} style={styles.friendName}>
          {item.appellation}
        </ThemedText>
      </View>
    </Pressable>
  )
})

const AlphaRailLetter = React.memo(function AlphaRailLetter({
  activeSectionIndex,
  index,
  letter,
  onPress
}: AlphaRailLetterProps) {
  const animatedTextStyle = useAnimatedStyle(() => {
    const isActive = activeSectionIndex.value === index

    return {
      color: isActive ? '#337EFF' : '#69707D',
      fontWeight: isActive ? '700' : '400'
    }
  }, [activeSectionIndex, index])

  return (
    <Pressable style={styles.alphaRailButton} onPress={onPress}>
      <Animated.Text style={[styles.alphaRailText, animatedTextStyle]}>{letter}</Animated.Text>
    </Pressable>
  )
})

const ContactsScreen = observer(() => {
  const { t } = useAppTranslation()
  const { runWithNavigationLock } = useNavigationLock()
  const listRef = useRef<SectionList<FriendDirectoryItem, FriendDirectorySection>>(null)
  const [listHeaderHeight, setListHeaderHeight] = useState(0)
  const scrollY = useSharedValue(0)
  const listHeaderHeightSv = useSharedValue(0)
  const activeSectionIndex = useSharedValue(-1)
  const [visibleFriendStatusAccountIds, setVisibleFriendStatusAccountIds] = useState<string[]>([])
  const friendSections = friendStore.friendSections
  const sectionIndex = useMemo(
    () => friendSections.map((section) => section.title),
    [friendSections]
  )
  const initialFriendStatusAccountIds = useMemo(
    () =>
      friendSections
        .flatMap((section) => section.data)
        .slice(0, CONTACT_INITIAL_STATUS_SUBSCRIBE_COUNT)
        .map((item) => item.accountId),
    [friendSections]
  )
  const friendStatusAccountIds = useMemo(
    () =>
      Array.from(new Set([...initialFriendStatusAccountIds, ...visibleFriendStatusAccountIds]))
        .filter(Boolean)
        .slice(0, CONTACT_INITIAL_STATUS_SUBSCRIBE_COUNT * 2),
    [initialFriendStatusAccountIds, visibleFriendStatusAccountIds]
  )
  const verificationUnreadCount = friendStore.displayUnreadApplicationCount
  const shortcutLabels = useMemo(
    () =>
      Object.fromEntries(shortcuts.map((item) => [item.key, t(item.labelKey as never)])) as Record<
        ShortcutItem['key'],
        string
      >,
    [t]
  )

  useEffect(() => {
    activeSectionIndex.value = sectionIndex.length ? 0 : -1
  }, [activeSectionIndex, sectionIndex.length])

  useUIKitUserStatusSubscription(friendStatusAccountIds)

  const handleShortcutPress = useCallback(
    (route: string) => {
      if (route === '/contacts/validlist') {
        friendStore.markApplicationsRead().catch(() => undefined)
      }

      runWithNavigationLock(() => {
        router.push(route as never)
      })
    },
    [runWithNavigationLock]
  )

  const handleFriendPress = useCallback(
    (accountId: string) => {
      runWithNavigationLock(() => {
        router.push({
          pathname: '/friend/friend-card',
          params: { accountId }
        } as never)
      })
    },
    [runWithNavigationLock]
  )

  const handleFriendViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FriendDirectoryItem>[] }) => {
      const nextAccountIds = Array.from(
        new Set(viewableItems.map((item) => item.item?.accountId).filter(Boolean))
      )
      setVisibleFriendStatusAccountIds(nextAccountIds)
    }
  ).current

  const renderFriendItem = useCallback(
    ({
      item,
      index,
      section
    }: SectionListRenderItemInfo<FriendDirectoryItem, FriendDirectorySection>) => (
      <FriendRow
        item={item}
        isLast={index === section.data.length - 1}
        onPress={handleFriendPress}
      />
    ),
    [handleFriendPress]
  )

  const listHeader = useMemo(
    () => (
      <View
        onLayout={(event) => {
          const nextHeight = event.nativeEvent.layout.height
          setListHeaderHeight(nextHeight)
          listHeaderHeightSv.value = nextHeight
        }}
      >
        {shortcuts.map((item, index) => (
          <ShortcutRow
            key={item.key}
            item={item}
            index={index}
            unreadCount={verificationUnreadCount}
            label={shortcutLabels[item.key]}
            onPress={handleShortcutPress}
          />
        ))}
      </View>
    ),
    [handleShortcutPress, listHeaderHeightSv, shortcutLabels, verificationUnreadCount]
  )

  const sectionStartOffsets = useMemo(() => {
    let nextOffset = listHeaderHeight

    return friendSections.map((section) => {
      const startOffset = nextOffset
      nextOffset += CONTACT_SECTION_HEADER_HEIGHT + section.data.length * CONTACT_FRIEND_ROW_HEIGHT

      return {
        title: section.title,
        startOffset
      }
    })
  }, [friendSections, listHeaderHeight])

  const alphaRailAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: Math.max(listHeaderHeightSv.value - scrollY.value, 0)
      }
    ]
  }))

  const handleListScroll = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        scrollY.value = event.contentOffset.y

        if (!sectionStartOffsets.length) {
          activeSectionIndex.value = -1
          return
        }

        const targetOffset = Math.max(event.contentOffset.y, 0)
        let nextSectionIndex = 0

        for (let index = 0; index < sectionStartOffsets.length; index += 1) {
          const nextSection = sectionStartOffsets[index + 1]

          if (!nextSection || targetOffset < nextSection.startOffset) {
            nextSectionIndex = index
            break
          }
        }

        activeSectionIndex.value = nextSectionIndex
      }
    },
    [sectionStartOffsets]
  )

  return (
    <UIKitWhitePage>
      <Stack.Screen
        options={{
          headerTitle: () => <ThemedHeaderTitle title={t('tabContacts' as never)} />,
          headerTitleAlign: 'left',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() =>
                  runWithNavigationLock(() => {
                    router.push('/conversation/search' as never)
                  })
                }
              >
                <UIKitIcon type="icon-conversation-search" size={22} tintColor="#333333" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() =>
                  runWithNavigationLock(() => {
                    router.push('/friend/add' as never)
                  })
                }
              >
                <UIKitIcon type="icon-addition" size={22} tintColor="#333333" />
              </TouchableOpacity>
            </View>
          )
        }}
      />

      <View style={styles.friendListWrap}>
        <AnimatedSectionList
          ref={listRef}
          sections={friendSections}
          keyExtractor={(item: FriendDirectoryItem) => item.accountId}
          removeClippedSubviews
          initialNumToRender={CONTACT_LIST_INITIAL_RENDER_COUNT}
          maxToRenderPerBatch={CONTACT_LIST_BATCH_RENDER_COUNT}
          windowSize={CONTACT_LIST_WINDOW_SIZE}
          updateCellsBatchingPeriod={16}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={<UIKitEmptyState title={t('commonNoFriends' as never)} />}
          onScroll={handleListScroll}
          onViewableItemsChanged={handleFriendViewableItemsChanged}
          viewabilityConfig={CONTACT_STATUS_VIEWABILITY_CONFIG}
          scrollEventThrottle={16}
          renderSectionHeader={({ section }: { section: FriendDirectorySection }) => (
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionHeaderText}>{section.title}</ThemedText>
            </View>
          )}
          renderItem={renderFriendItem}
          contentContainerStyle={styles.friendListContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />

        {sectionIndex.length ? (
          <Animated.View
            pointerEvents="box-none"
            style={[styles.alphaRail, alphaRailAnimatedStyle]}
          >
            {sectionIndex.map((letter, index) => (
              <AlphaRailLetter
                key={`${letter}-${index}`}
                activeSectionIndex={activeSectionIndex}
                index={index}
                letter={letter}
                onPress={() => {
                  activeSectionIndex.value = index
                  listRef.current?.scrollToLocation({
                    sectionIndex: index,
                    itemIndex: 0,
                    animated: true,
                    viewOffset: 0
                  })
                }}
              />
            ))}
          </Animated.View>
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
    fontSize: 16,
    fontWeight: '400',
    color: '#333333'
  },
  shortcutRow: {
    minHeight: 60,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center'
  },
  shortcutRowPressed: {
    backgroundColor: '#EEF1F5'
  },
  shortcutIconWrap: {
    marginRight: 12
  },
  shortcutBody: {
    flex: 1
  },
  shortcutBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 10,
    paddingHorizontal: 6,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shortcutBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700'
  },
  shortcutDivider: {
    position: 'absolute',
    left: 68,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#EEF2F7'
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
    paddingVertical: 8,
    paddingRight: 12
  },
  friendBody: {
    flex: 1,
    minHeight: 64,
    justifyContent: 'center',
    paddingRight: 28
  },
  friendBodyBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7'
  },
  friendName: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 22
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
    fontSize: 12,
    lineHeight: 16
  }
})

function ThemedHeaderTitle({ title }: { title: string }) {
  return <ThemedText style={styles.headerTitleText}>{title}</ThemedText>
}

export default ContactsScreen
