import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import {
  UIKitEmptyState,
  UIKitRowDivider,
  UIKitSearchBar,
  UIKitSectionLabel,
  UIKitUserAvatar,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import { friendStore, nimStore, userStore } from '@/stores'

const FriendAddScreen = observer(() => {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState(awaitedEmpty)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const deferredKeyword = useDeferredValue(keyword.trim())

  useEffect(() => {
    let cancelled = false

    const runSearch = async () => {
      if (!deferredKeyword) {
        startTransition(() => {
          setResults([])
          setError('')
        })
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const users = await userStore.searchUsers(deferredKeyword)

        if (cancelled) {
          return
        }

        startTransition(() => {
          setResults(users)
        })
      } catch (searchError) {
        if (cancelled) {
          return
        }

        startTransition(() => {
          setResults([])
          setError(searchError instanceof Error ? searchError.message : '搜索失败')
        })
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    runSearch().catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [deferredKeyword])

  const hasSearched = !!deferredKeyword

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{ title: '添加好友', headerTitleAlign: 'center', headerShown: true }}
      />

      <UIKitSearchBar
        value={keyword}
        onChangeText={setKeyword}
        placeholder="请输入账号"
        style={styles.searchBar}
      />

      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

      {hasSearched ? <UIKitSectionLabel label="搜索结果" style={styles.sectionLabel} /> : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.accountId}
        ListEmptyComponent={
          hasSearched ? (
            <View style={styles.emptyState}>
              {loading ? (
                <ThemedText style={styles.emptyText}>搜索中…</ThemedText>
              ) : (
                <UIKitEmptyState
                  title="未找到相关账号"
                  subtitle="请确认输入的账号、昵称或手机号是否正确。"
                />
              )}
            </View>
          ) : (
            <View style={styles.blankState} />
          )
        }
        renderItem={({ item, index }) => {
          const currentAccountId = nimStore.getLoginUser()
          const isSelf = currentAccountId === item.accountId
          const isFriend = friendStore.friends.has(item.accountId)

          return (
            <View style={styles.resultRowWrap}>
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() =>
                  router.push({
                    pathname: '/friend/friend-card',
                    params: { accountId: item.accountId }
                  } as never)
                }
              >
                <UIKitUserAvatar account={item.accountId} avatar={item.avatar} size={54} />
                <View style={styles.resultBody}>
                  <HighlightedLabel
                    value={item.name || item.accountId}
                    keyword={deferredKeyword}
                    style={styles.resultName}
                  />
                  <HighlightedLabel
                    value={item.accountId}
                    keyword={deferredKeyword}
                    style={styles.resultSubText}
                  />
                </View>
                {isSelf ? (
                  <ThemedText style={styles.sideHint}>自己</ThemedText>
                ) : isFriend ? (
                  <ThemedText style={styles.sideHint}>已添加</ThemedText>
                ) : null}
              </TouchableOpacity>
              {index < results.length - 1 ? <UIKitRowDivider /> : null}
            </View>
          )
        }}
        contentContainerStyle={styles.resultListContent}
        keyboardShouldPersistTaps="handled"
      />
    </UIKitWhitePage>
  )
})

function HighlightedLabel({
  value,
  keyword,
  style
}: {
  value: string
  keyword: string
  style: {
    color: string
    fontSize: number
    lineHeight: number
    marginTop?: number
  }
}) {
  const normalizedValue = value.toLowerCase()
  const normalizedKeyword = keyword.toLowerCase()
  const matchIndex = normalizedKeyword ? normalizedValue.indexOf(normalizedKeyword) : -1

  if (matchIndex < 0) {
    return (
      <ThemedText numberOfLines={1} style={style}>
        {value}
      </ThemedText>
    )
  }

  const before = value.slice(0, matchIndex)
  const match = value.slice(matchIndex, matchIndex + keyword.length)
  const after = value.slice(matchIndex + keyword.length)

  return (
    <ThemedText numberOfLines={1} style={style}>
      {before}
      <Text style={styles.highlightText}>{match}</Text>
      {after}
    </ThemedText>
  )
}

const awaitedEmpty: Awaited<ReturnType<typeof userStore.searchUsers>> = []

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchBar: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 14
  },
  sectionLabel: {
    marginHorizontal: 20,
    marginBottom: 8
  },
  errorText: {
    marginHorizontal: 20,
    marginBottom: 10,
    color: '#B42318'
  },
  resultListContent: {
    flexGrow: 1
  },
  blankState: {
    flex: 1
  },
  emptyState: {
    paddingTop: 48
  },
  emptyText: {
    color: '#A6AFBB',
    textAlign: 'center'
  },
  resultRowWrap: {
    backgroundColor: '#FFFFFF'
  },
  resultRow: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 14
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
  },
  sideHint: {
    color: '#A6AFBB',
    fontSize: 14,
    lineHeight: 20
  }
})

export default FriendAddScreen
