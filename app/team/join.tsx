import { Image } from 'expo-image'
import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitPage, UIKitSearchBar, UIKitUserAvatar } from '@/src/NEUIKit/rn'
import { conversationStore, nimStore, teamStore } from '@/stores'
import { getDisplayErrorMessage } from '@/utils/error-message'
import { ensureNetworkAvailable, getNetworkUnavailableMessage } from '@/utils/network'
import { V2NIMConst, V2NIMTeam, V2NIMTeamJoinMode } from '@/utils/nim-sdk'

const EMPTY_IMAGE = require('@/src/NEUIKit/static/empty.png')

function isTeamNotFoundError(error: unknown) {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code?: unknown }).code
      : undefined
  const nimErrorCode = V2NIMConst.V2NIMErrorCode || {}
  const notFoundCodes = [
    nimErrorCode.V2NIM_ERROR_CODE_TEAM_NOT_EXIST,
    nimErrorCode.V2NIM_ERROR_CODE_RESOURCE_NOT_EXIST,
    191006
  ].filter((item) => item !== undefined)

  if (notFoundCodes.includes(code)) {
    return true
  }

  const message = error instanceof Error ? error.message : String(error || '')
  return /群.*不存在|group.*not exist|team.*not exist|resource.*not exist|not\s+found/i.test(
    message
  )
}

const TeamJoinScreen = observer(() => {
  const { t } = useAppTranslation()
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searched, setSearched] = useState(false)
  const [team, setTeam] = useState<V2NIMTeam | null>(null)

  const joined = !!team?.teamId && teamStore.teamList.some((item) => item.teamId === team.teamId)

  const openTeamChat = async (targetTeam: V2NIMTeam) => {
    if (!targetTeam.teamId || !nimStore.nim) {
      return
    }

    const conversationId = nimStore.nim.V2NIMConversationIdUtil.teamConversationId(
      targetTeam.teamId
    )

    conversationStore.upsertTeamPlaceholderConversation(conversationId, {
      teamId: targetTeam.teamId,
      name: targetTeam.name || targetTeam.teamId,
      avatar: targetTeam.avatar
    })
    await conversationStore.createConversation(conversationId).catch(() => undefined)
    router.replace({ pathname: '/chat/[id]', params: { id: conversationId } })
  }

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim()

    if (!trimmedKeyword) {
      toast.alert(t('commonTip'), t('teamJoinSearchEmpty'))
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      await ensureNetworkAvailable()
      const result = await teamStore.getTeamById(trimmedKeyword)
      setTeam(result)
    } catch (error) {
      setTeam(null)
      if (isTeamNotFoundError(error)) {
        return
      }
      toast.alert(
        t('commonLoadingFailed'),
        error instanceof Error ? error.message : getNetworkUnavailableMessage()
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoChat = async () => {
    if (!team?.teamId || submitting) {
      return
    }

    setSubmitting(true)

    try {
      await openTeamChat(team)
    } catch (error) {
      toast.alert(
        t('teamJoinGoChatFailed'),
        error instanceof Error ? error.message : getNetworkUnavailableMessage()
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleApply = async () => {
    if (!team?.teamId || joined || submitting) {
      return
    }

    setSubmitting(true)

    try {
      await ensureNetworkAvailable()
      const joinedTeam = await teamStore.applyJoinTeam(team.teamId)

      if (!joinedTeam) {
        return
      }

      const canJoinDirectly = joinedTeam.joinMode === V2NIMTeamJoinMode.V2NIM_TEAM_JOIN_MODE_FREE

      if (canJoinDirectly) {
        teamStore.markRecentlyJoinedTeam(joinedTeam.teamId || team.teamId)
        await openTeamChat(joinedTeam)
        return
      }

      toast.alert(t('commonTip'), t('teamJoinApplySuccess'))
    } catch (error) {
      toast.alert(
        t('teamJoinApplyFailed'),
        getDisplayErrorMessage(error, getNetworkUnavailableMessage())
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleActionPress = () => {
    const action = joined ? handleGoChat : handleApply
    action().catch(() => undefined)
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: t('teamJoinTitle'), headerTitleAlign: 'center' }} />

      <View style={styles.content}>
        <UIKitSearchBar
          value={keyword}
          onChangeText={(value) => {
            setKeyword(value)
            if (!value.trim()) {
              setSearched(false)
              setTeam(null)
            }
          }}
          placeholder={t('teamJoinPlaceholder')}
          autoFocus
          onSubmitEditing={() => {
            handleSearch().catch(() => undefined)
          }}
        />

        {searched ? (
          loading ? (
            <View style={styles.card}>
              <View style={styles.stateWrap}>
                <ActivityIndicator color="#337EFF" />
              </View>
            </View>
          ) : team ? (
            <View style={styles.card}>
              <View style={styles.resultRow}>
                <UIKitUserAvatar
                  account={team.teamId || team.name || t('commonGroupChat')}
                  avatar={team.avatar}
                  size={40}
                />
                <View style={styles.resultMeta}>
                  <ThemedText numberOfLines={1} style={styles.resultTitle}>
                    {team.name || team.teamId}
                  </ThemedText>
                  <ThemedText style={styles.resultSubtitle}>
                    {t('teamSettingsGroupId', { teamId: team.teamId })}
                  </ThemedText>
                </View>
                <Pressable
                  disabled={submitting}
                  style={[styles.applyButton, submitting && styles.applyButtonDisabled]}
                  onPress={handleActionPress}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ThemedText style={styles.applyButtonText}>
                      {joined ? t('teamJoinGoChat') : t('teamJoinApply')}
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.stateWrap}>
              <Image source={EMPTY_IMAGE} style={styles.emptyImage} contentFit="contain" />
              <ThemedText style={styles.emptyText}>{t('teamJoinNoResult')}</ThemedText>
            </View>
          )
        ) : null}
      </View>
    </UIKitPage>
  )
})

const styles = StyleSheet.create({
  page: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 12
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  stateWrap: {
    minHeight: 148,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  emptyText: {
    color: '#98A1AD',
    fontSize: 14,
    lineHeight: 20
  },
  emptyImage: {
    width: 160,
    height: 120,
    marginBottom: 12
  },
  resultRow: {
    minHeight: 76,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  resultMeta: {
    flex: 1
  },
  resultTitle: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500'
  },
  resultSubtitle: {
    marginTop: 4,
    color: '#98A1AD',
    fontSize: 13,
    lineHeight: 18
  },
  applyButton: {
    minWidth: 84,
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  applyButtonDisabled: {
    backgroundColor: '#E6EBF2'
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600'
  },
  applyButtonTextDisabled: {
    color: '#98A1AD'
  }
})

export default TeamJoinScreen
