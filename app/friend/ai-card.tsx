import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitActionCell, UIKitProfileHero, UIKitWhitePage } from '@/src/NEUIKit/rn'
import { conversationStore, imStoreV2Bridge, nimStore, userStore } from '@/stores'

const AIUserCardScreen = observer(() => {
  const { t } = useAppTranslation()
  const { accountId } = useLocalSearchParams<{ accountId?: string }>()
  const resolvedAccountId = typeof accountId === 'string' ? accountId : ''

  useEffect(() => {
    if (!resolvedAccountId) {
      return
    }

    imStoreV2Bridge.ensureAIUsersLoaded().catch(() => undefined)
    userStore.fetchUser(resolvedAccountId).catch(() => undefined)
  }, [resolvedAccountId])

  const aiUser = imStoreV2Bridge.aiUsers.find((item) => item.accountId === resolvedAccountId)
  const profile = userStore.users.get(resolvedAccountId)
  const title = aiUser?.name || profile?.name || resolvedAccountId || t('commonUnknownAccount')
  const avatar = aiUser?.avatar || profile?.avatar
  const conversationId = nimStore.nim?.V2NIMConversationIdUtil.p2pConversationId(resolvedAccountId)

  const detailLines = useMemo(() => {
    const lines: string[] = []
    const nickname = profile?.name || aiUser?.name

    if (nickname && nickname !== title) {
      lines.push(t('commonNicknameText', { name: nickname }))
    }

    if (resolvedAccountId) {
      lines.push(t('commonAccountText', { account: resolvedAccountId }))
    }

    return lines
  }, [aiUser?.name, profile?.name, resolvedAccountId, t, title])

  const openChat = async () => {
    if (!conversationId) {
      return
    }

    try {
      await conversationStore.createConversation(conversationId)
      router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
    } catch (error) {
      toast.alert(
        t('commonOpenFailed'),
        error instanceof Error ? error.message : t('commonRetryLater')
      )
    }
  }

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerTitleAlign: 'center',
          headerShown: true
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <UIKitProfileHero
          account={resolvedAccountId}
          avatar={avatar}
          title={title}
          lines={detailLines}
        />

        <View style={styles.group}>
          <UIKitActionCell label={t('chatButtonText' as never)} onPress={openChat} />
        </View>
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

export default AIUserCardScreen
