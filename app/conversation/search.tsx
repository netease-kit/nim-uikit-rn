import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { SectionList, StyleSheet, Text, type TextStyle, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitEmptyState,
  UIKitRowDivider,
  UIKitSearchBar,
  UIKitSectionLabel,
  UIKitUserAvatar,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import {
  conversationStore,
  friendStore,
  getTeamCategory,
  nimStore,
  TEAM_CATEGORY,
  teamStore
} from '@/stores'

type FriendSearchRow = {
  key: string
  kind: 'friend'
  accountId: string
  title: string
  subtitle: string
  avatar?: string
}

type TeamSearchRow = {
  key: string
  kind: 'team'
  teamId: string
  title: string
  subtitle: string
  avatar?: string
  category: (typeof TEAM_CATEGORY)[keyof typeof TEAM_CATEGORY]
}

type SearchRow = FriendSearchRow | TeamSearchRow

type SearchSection = {
  key: string
  title: string
  data: SearchRow[]
}

const SEARCH_RESULT_INITIAL_RENDER_COUNT = 12
const SEARCH_RESULT_BATCH_RENDER_COUNT = 10
const SEARCH_RESULT_WINDOW_SIZE = 8

function HighlightedText({
  text,
  keyword,
  style,
  numberOfLines
}: {
  text: string
  keyword: string
  style?: TextStyle
  numberOfLines?: number
}) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  const normalizedText = text.toLowerCase()

  if (!normalizedKeyword) {
    return (
      <ThemedText numberOfLines={numberOfLines} ellipsizeMode="tail" style={style}>
        {text}
      </ThemedText>
    )
  }

  const parts: { value: string; highlighted: boolean }[] = []
  let cursor = 0

  while (cursor < text.length) {
    const hit = normalizedText.indexOf(normalizedKeyword, cursor)

    if (hit < 0) {
      parts.push({ value: text.slice(cursor), highlighted: false })
      break
    }

    if (hit > cursor) {
      parts.push({ value: text.slice(cursor, hit), highlighted: false })
    }

    parts.push({
      value: text.slice(hit, hit + keyword.length),
      highlighted: true
    })
    cursor = hit + keyword.length
  }

  return (
    <ThemedText numberOfLines={numberOfLines} ellipsizeMode="tail" style={style}>
      {parts.map((part, index) =>
        part.highlighted ? (
          <Text key={`${part.value}-${index}`} style={styles.highlightText}>
            {part.value}
          </Text>
        ) : (
          <Fragment key={`${part.value}-${index}`}>{part.value}</Fragment>
        )
      )}
    </ThemedText>
  )
}

const ConversationSearchScreen = observer(() => {
  const { t } = useAppTranslation()
  const [inputKeyword, setInputKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const normalizedKeyword = submittedKeyword.trim().toLowerCase()
  const { runWithNavigationLock, isNavigationLocked } = useNavigationLock()
  const friendSections = friendStore.friendSections
  const friendSearchCandidates = useMemo(
    () => friendSections.flatMap((section) => section.data),
    [friendSections]
  )

  const handleChangeKeyword = useCallback((value: string) => {
    setInputKeyword(value)

    if (!value.trim()) {
      setSubmittedKeyword('')
    }
  }, [])

  const handleSubmitSearch = useCallback(() => {
    setSubmittedKeyword(inputKeyword.trim())
  }, [inputKeyword])

  const sections = useMemo<SearchSection[]>(() => {
    if (!normalizedKeyword) {
      return []
    }

    const friendMatches: FriendSearchRow[] = friendSearchCandidates
      .filter((item) => {
        const name = item.appellation.toLowerCase()

        return (
          name.includes(normalizedKeyword) ||
          item.accountId.toLowerCase().includes(normalizedKeyword)
        )
      })
      .map((item) => ({
        key: `friend-${item.accountId}`,
        kind: 'friend',
        accountId: item.accountId,
        title: item.appellation,
        subtitle: item.accountId,
        avatar: item.avatar
      }))

    const teamMatches: TeamSearchRow[] = teamStore.teamList
      .filter((item) => (item.name || item.teamId).toLowerCase().includes(normalizedKeyword))
      .map((item) => ({
        key: `team-${item.teamId}`,
        kind: 'team',
        teamId: item.teamId,
        title: item.name || item.teamId,
        subtitle: t('teamSettingsGroupId', { teamId: item.teamId }),
        avatar: item.avatar,
        category: getTeamCategory(item)
      }))
    const discussionTeamMatches: TeamSearchRow[] = teamMatches.filter(
      (item) => item.category === TEAM_CATEGORY.DISCUSSION
    )
    const advancedTeamMatches: TeamSearchRow[] = teamMatches.filter(
      (item) => item.category !== TEAM_CATEGORY.DISCUSSION
    )

    const nextSections: SearchSection[] = []

    if (friendMatches.length > 0) {
      nextSections.push({
        key: 'friends',
        title: t('commonFriend'),
        data: friendMatches
      })
    }

    if (discussionTeamMatches.length > 0) {
      nextSections.push({
        key: 'discussion-teams',
        title: t('teamTypeDiscussion'),
        data: discussionTeamMatches
      })
    }

    if (advancedTeamMatches.length > 0) {
      nextSections.push({
        key: 'advanced-teams',
        title: t('teamTypeAdvanced'),
        data: advancedTeamMatches
      })
    }

    return nextSections
  }, [friendSearchCandidates, normalizedKeyword, t])

  const handlePress = async (item: FriendSearchRow | TeamSearchRow) => {
    if (item.kind === 'friend') {
      if (!friendStore.friends.has(item.accountId) && nimStore.getLoginUser() !== item.accountId) {
        toast.alert(t('commonOpenFailed'), t('conversationSearchInvalidFriend'))
        return
      }

      const conversationId = nimStore.nim?.V2NIMConversationIdUtil.p2pConversationId(item.accountId)
      if (!conversationId) {
        return
      }

      runWithNavigationLock(() => {
        router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
      })
      return
    }

    if (!teamStore.getTeam(item.teamId)) {
      toast.alert(t('commonGroupChat'), t('conversationSearchLeftTeam'))
      return
    }

    const conversationId = nimStore.nim?.V2NIMConversationIdUtil.teamConversationId(item.teamId)
    if (!conversationId) {
      toast.alert(t('commonGroupChat'), t('conversationSearchLeftTeam'))
      return
    }

    conversationStore.upsertTeamPlaceholderConversation(conversationId, {
      teamId: item.teamId,
      name: item.title,
      avatar: item.avatar
    })

    runWithNavigationLock(() => {
      router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
    })
  }

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{
          title: t('conversationSearchTitle'),
          headerTitleAlign: 'center',
          headerShown: true
        }}
      />

      <UIKitSearchBar
        value={inputKeyword}
        onChangeText={handleChangeKeyword}
        onSubmitEditing={handleSubmitSearch}
        placeholder={t('commonSearchKeywordPlaceholder')}
        style={styles.searchBar}
        autoFocus
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        removeClippedSubviews
        initialNumToRender={SEARCH_RESULT_INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={SEARCH_RESULT_BATCH_RENDER_COUNT}
        windowSize={SEARCH_RESULT_WINDOW_SIZE}
        updateCellsBatchingPeriod={16}
        ListEmptyComponent={
          normalizedKeyword ? (
            <View style={styles.emptyState}>
              <UIKitEmptyState title={t('commonUserNotFound')} />
            </View>
          ) : (
            <View style={styles.blankState} />
          )
        }
        renderSectionHeader={({ section }) => (
          <UIKitSectionLabel label={section.title} style={styles.sectionLabel} />
        )}
        renderItem={({ item, index, section }) => {
          return (
            <View style={styles.resultWrap}>
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => handlePress(item)}
                disabled={isNavigationLocked()}
              >
                <UIKitUserAvatar
                  account={item.kind === 'friend' ? item.accountId : item.teamId}
                  avatar={item.avatar}
                  size={42}
                />
                <View style={styles.resultBody}>
                  <HighlightedText
                    text={item.title}
                    keyword={submittedKeyword}
                    style={styles.resultName}
                    numberOfLines={1}
                  />
                  <HighlightedText
                    text={item.subtitle}
                    keyword={submittedKeyword}
                    style={styles.resultSubText}
                  />
                </View>
              </TouchableOpacity>
              {index < section.data.length - 1 ? <UIKitRowDivider /> : null}
            </View>
          )
        }}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
      />
    </UIKitWhitePage>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchBar: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 14
  },
  emptyState: {
    paddingTop: 48
  },
  blankState: {
    flex: 1
  },
  listContent: {
    flexGrow: 1
  },
  sectionLabel: {
    marginHorizontal: 20,
    marginBottom: 8
  },
  resultWrap: {
    backgroundColor: '#FFFFFF'
  },
  resultRow: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20
  },
  resultBody: {
    flex: 1
  },
  resultName: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24
  },
  resultSubText: {
    marginTop: 2,
    color: '#A6AFBB',
    fontSize: 14,
    lineHeight: 20
  },
  highlightText: {
    color: '#337EFF'
  }
})

export default ConversationSearchScreen
