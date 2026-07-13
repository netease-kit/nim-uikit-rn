import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { startTransition, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import {
  resolveUIKitProfileRoute,
  UIKitEmptyState,
  UIKitSearchBar,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import { nimStore, userStore } from '@/stores'
import { getDisplayErrorMessage } from '@/utils/error-message'
import { ensureNetworkAvailable, getNetworkUnavailableMessage } from '@/utils/network'
import { V2NIMUser } from '@/utils/nim-sdk'

const FriendAddScreen = observer(() => {
  const { t } = useAppTranslation()
  const { runWithNavigationLock } = useNavigationLock()
  const [keyword, setKeyword] = useState('')
  const [hasNoResult, setHasNoResult] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchedKeyword, setSearchedKeyword] = useState('')

  const openResultCard = useCallback(
    (user: V2NIMUser) => {
      const isSelf = user.accountId === nimStore.getLoginUser()

      if (isSelf) {
        runWithNavigationLock(() => {
          router.push('/user/my-detail' as never)
        })
        return
      }

      resolveUIKitProfileRoute(user.accountId).then((pathname) => {
        runWithNavigationLock(() => {
          router.push({
            pathname,
            params: { accountId: user.accountId }
          } as never)
        })
      })
    },
    [runWithNavigationLock]
  )

  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value)
    setLoading(false)
    startTransition(() => {
      setSearchedKeyword('')
      setHasNoResult(false)
      setError('')
    })
  }, [])

  const handleSearchSubmit = useCallback(async () => {
    const trimmedKeyword = keyword.trim()

    startTransition(() => {
      setSearchedKeyword(trimmedKeyword)
      setHasNoResult(false)
      setError('')
    })

    if (!trimmedKeyword) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      await ensureNetworkAvailable()
      const user = await userStore.searchAccountExactly(trimmedKeyword)

      if (user) {
        startTransition(() => {
          setHasNoResult(false)
        })
        openResultCard(user)
        return
      }

      startTransition(() => {
        setHasNoResult(true)
      })
    } catch (searchError) {
      startTransition(() => {
        setHasNoResult(true)
        setError(getDisplayErrorMessage(searchError, getNetworkUnavailableMessage()))
      })
    } finally {
      setLoading(false)
    }
  }, [keyword, openResultCard])

  const hasSearched = !!searchedKeyword

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{ title: t('friendAddTitle'), headerTitleAlign: 'center', headerShown: true }}
      />

      <UIKitSearchBar
        value={keyword}
        onChangeText={handleKeywordChange}
        onSubmitEditing={handleSearchSubmit}
        placeholder={t('friendAddPlaceholder')}
        style={styles.searchBar}
      />

      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

      {hasSearched ? (
        <View style={styles.emptyState}>
          {loading ? (
            <ThemedText style={styles.emptyText}>{t('commonSearch')}...</ThemedText>
          ) : hasNoResult ? (
            <UIKitEmptyState title={t('commonUserNotFound')} />
          ) : null}
        </View>
      ) : (
        <View style={styles.blankState} />
      )}
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
  errorText: {
    marginHorizontal: 20,
    marginBottom: 10,
    color: '#B42318'
  },
  blankState: {
    flex: 1
  },
  emptyState: {
    paddingTop: 16
  },
  emptyText: {
    color: '#A6AFBB',
    textAlign: 'center'
  }
})

export default FriendAddScreen
