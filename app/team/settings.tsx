import { useNavigation } from '@react-navigation/native'
import { StackActions } from '@react-navigation/routers'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitActionCell,
  UIKitIcon,
  UIKitInfoRow,
  UIKitPage,
  UIKitRowDivider,
  UIKitSwitchRow,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import {
  conversationStore,
  friendStore,
  getTeamCategory,
  imStoreV2Bridge,
  messageStore,
  nimStore,
  TEAM_CATEGORY,
  teamStore,
  userStore
} from '@/stores'
import { getDisplayErrorMessage } from '@/utils/error-message'
import { ensureNetworkAvailable, getConfirmedOfflineMessage } from '@/utils/network'
import {
  V2NIMTeamChatBannedMode,
  V2NIMTeamInviteMode,
  V2NIMTeamMember,
  V2NIMTeamMemberRole
} from '@/utils/nim-sdk'

function getConversationForSettings(conversationId: string) {
  return (
    imStoreV2Bridge.getConversation(conversationId) ||
    conversationStore.getConversation(conversationId)
  )
}

function getConversationMutationStore() {
  const preferCloudConversation = !!imStoreV2Bridge.rootStore?.sdkOptions?.enableV2CloudConversation
  const localConversationStore = imStoreV2Bridge.rootStore?.localConversationStore
  const cloudConversationStore = imStoreV2Bridge.rootStore?.conversationStore

  if (preferCloudConversation && cloudConversationStore) {
    return cloudConversationStore
  }

  return localConversationStore || cloudConversationStore || null
}

type TeamExitNavigation = {
  getState: () =>
    | {
        routes: {
          params?: unknown
        }[]
      }
    | undefined
  dispatch: (action: ReturnType<typeof StackActions.pop>) => void
}

function returnAfterTeamExit(navigation: TeamExitNavigation, conversationId: string) {
  const routes = navigation.getState()?.routes

  if (!routes?.length) {
    router.replace('/(tabs)' as never)
    return
  }

  const previousRoute = routes[routes.length - 2]
  const previousRouteConversationId =
    typeof previousRoute?.params === 'object' &&
    previousRoute.params &&
    'id' in previousRoute.params &&
    typeof previousRoute.params.id === 'string'
      ? previousRoute.params.id
      : ''
  const popCount = previousRouteConversationId === conversationId ? 2 : 1

  if (routes.length > popCount) {
    navigation.dispatch(StackActions.pop(popCount))
    return
  }

  router.replace('/(tabs)' as never)
}

async function deleteTeamConversationData(conversationId: string) {
  if (!conversationId) {
    return
  }

  const conversationMutationStore = getConversationMutationStore()
  conversationMutationStore?.removeConversation?.([conversationId])

  const nim = nimStore.nim

  if (nim) {
    if (imStoreV2Bridge.preferCloudConversation) {
      await nim.V2NIMConversationService.deleteConversation(conversationId, true)
    } else {
      await nim.V2NIMLocalConversationService.deleteConversation(conversationId, true)
    }
  }

  conversationStore.removeTeamConversationLocally(conversationId)
  messageStore.clearConversationMessages(conversationId)
}

const TeamSettingsScreen = observer(() => {
  const { t } = useAppTranslation()
  const { teamId, conversationId } = useLocalSearchParams<{
    teamId?: string
    conversationId?: string
  }>()
  const navigation = useNavigation()
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const team = teamStore.getTeam(resolvedTeamId)
  const members = teamStore.getMembers(resolvedTeamId)
  const myRole = teamStore.getMyMemberRole(resolvedTeamId)
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [savingMute, setSavingMute] = useState(false)
  const [savingStickTop, setSavingStickTop] = useState(false)
  const [savingChatBanned, setSavingChatBanned] = useState(false)
  const { runWithNavigationLock } = useNavigationLock()

  const isOwner = myRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
  const canManageTeam = myRole !== V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL
  const memberCount = team?.memberCount || members.length
  const memberLimit = team?.memberLimit || 0
  const isMemberLimitReached = memberLimit > 0 && memberCount >= memberLimit
  const canInviteMembers =
    !isMemberLimitReached &&
    (canManageTeam || team?.inviteMode === V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL)
  const isDiscussion = getTeamCategory(team) === TEAM_CATEGORY.DISCUSSION
  const settingsCopy = {
    avatarLabel: isDiscussion ? t('teamSettingsDiscussionAvatar') : t('teamSettingsAvatar'),
    dangerAction: isDiscussion
      ? t('teamSettingsExitDiscussion')
      : isOwner
        ? t('teamSettingsDismissGroup')
        : t('teamSettingsExitGroup'),
    dangerConfirm: isDiscussion
      ? t('teamSettingsExitDiscussionConfirm')
      : isOwner
        ? t('teamSettingsDismissGroupConfirm')
        : t('teamSettingsExitGroupConfirm'),
    dangerConfirmAction: isDiscussion || !isOwner ? t('commonExit') : t('commonDismiss'),
    nameLabel: isDiscussion ? t('teamSettingsDiscussionName') : t('teamSettingsName'),
    typeLabel: isDiscussion ? t('teamTypeDiscussion') : t('teamTypeAdvanced'),
    memberLabel: isDiscussion
      ? t('teamSettingsDiscussionMemberCount')
      : t('teamSettingsMemberCount')
  }

  const loadTeamDetails = useCallback(async () => {
    if (!resolvedTeamId) {
      return
    }

    setLoading(true)
    setLoadFailed(false)

    try {
      await Promise.all([
        teamStore.refreshTeamInfo(resolvedTeamId),
        teamStore.loadMembers(resolvedTeamId)
      ])
    } catch (error) {
      setLoadFailed(true)
      toast.alert(
        t('commonLoadingFailed'),
        getDisplayErrorMessage(error, t('teamSettingsLoadFailed'))
      )
    } finally {
      setLoading(false)
    }
  }, [resolvedTeamId, t])

  useEffect(() => {
    loadTeamDetails().catch(() => undefined)
  }, [loadTeamDetails])

  useEffect(() => {
    if (!nimStore.nim || !resolvedTeamId) {
      return
    }

    const hasCurrentTeamMember = (teamMembers: V2NIMTeamMember[]) =>
      teamMembers.some((member) => member.teamId === resolvedTeamId)
    const refreshCurrentTeamInfo = (teamLike?: { teamId?: string } | null) => {
      if (teamLike?.teamId === resolvedTeamId) {
        loadTeamDetails().catch(() => undefined)
      }
    }
    const refreshCurrentTeamMembers = (teamMembers: V2NIMTeamMember[]) => {
      if (hasCurrentTeamMember(teamMembers)) {
        loadTeamDetails().catch(() => undefined)
      }
    }
    const refreshCurrentTeamMembersWithOperator = (
      _operateAccountId: string,
      teamMembers: V2NIMTeamMember[]
    ) => {
      refreshCurrentTeamMembers(teamMembers)
    }
    const refreshCurrentTeamMemberInfo = (teamMembers: V2NIMTeamMember[]) => {
      if (hasCurrentTeamMember(teamMembers)) {
        teamStore.applyTeamMembers(teamMembers)
        loadTeamDetails().catch(() => undefined)
      }
    }

    nimStore.nim.V2NIMTeamService.on('onTeamInfoUpdated', refreshCurrentTeamInfo)
    nimStore.nim.V2NIMTeamService.on('onTeamMemberJoined', refreshCurrentTeamMembers)
    nimStore.nim.V2NIMTeamService.on('onTeamMemberKicked', refreshCurrentTeamMembersWithOperator)
    nimStore.nim.V2NIMTeamService.on('onTeamMemberLeft', refreshCurrentTeamMembers)
    nimStore.nim.V2NIMTeamService.on('onTeamMemberInfoUpdated', refreshCurrentTeamMemberInfo)

    return () => {
      nimStore.nim?.V2NIMTeamService.off('onTeamInfoUpdated', refreshCurrentTeamInfo)
      nimStore.nim?.V2NIMTeamService.off('onTeamMemberJoined', refreshCurrentTeamMembers)
      nimStore.nim?.V2NIMTeamService.off(
        'onTeamMemberKicked',
        refreshCurrentTeamMembersWithOperator
      )
      nimStore.nim?.V2NIMTeamService.off('onTeamMemberLeft', refreshCurrentTeamMembers)
      nimStore.nim?.V2NIMTeamService.off('onTeamMemberInfoUpdated', refreshCurrentTeamMemberInfo)
    }
  }, [loadTeamDetails, resolvedTeamId])

  const handleToggleMute = async (value: boolean) => {
    if (savingMute) {
      return
    }

    try {
      setSavingMute(true)
      await ensureNetworkAvailable()
      await conversationStore.toggleMute(resolvedConversationId, !value)
      await imStoreV2Bridge.refreshCurrentConversationSource()
    } catch (error) {
      const offlineMessage = await getConfirmedOfflineMessage()
      toast.alert(
        t('settingsUpdateFailed'),
        offlineMessage || getDisplayErrorMessage(error, t('commonRetryLater'))
      )
    } finally {
      setSavingMute(false)
    }
  }

  const handleToggleStickTop = async (value: boolean) => {
    if (savingStickTop) {
      return
    }

    try {
      setSavingStickTop(true)
      await ensureNetworkAvailable()
      const conversationMutationStore = getConversationMutationStore()

      if (conversationMutationStore) {
        await imStoreV2Bridge.stickTopActiveConversation(resolvedConversationId, value)
        return
      }

      await conversationStore.toggleStickTop(resolvedConversationId, value)
    } catch (error) {
      const offlineMessage = await getConfirmedOfflineMessage()
      toast.alert(
        t('settingsUpdateFailed'),
        offlineMessage || getDisplayErrorMessage(error, t('commonRetryLater'))
      )
    } finally {
      setSavingStickTop(false)
    }
  }

  const handleToggleChatBanned = async (value: boolean) => {
    if (savingChatBanned) {
      return
    }

    try {
      setSavingChatBanned(true)
      await ensureNetworkAvailable()
      await teamStore.setChatBannedMode(
        resolvedTeamId,
        value
          ? V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL
          : V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
      )
    } catch (error) {
      const offlineMessage = await getConfirmedOfflineMessage()
      toast.alert(
        t('settingsUpdateFailed'),
        offlineMessage || getDisplayErrorMessage(error, t('commonRetryLater'))
      )
    } finally {
      setSavingChatBanned(false)
    }
  }

  const confirmDangerAction = () => {
    Alert.alert(settingsCopy.dangerAction, settingsCopy.dangerConfirm, [
      {
        text: settingsCopy.dangerConfirmAction,
        style: 'destructive',
        onPress: async () => {
          let completed = false

          try {
            await ensureNetworkAvailable()
            conversationStore.markTeamExitInProgress(resolvedConversationId)

            if (isDiscussion) {
              await teamStore.leaveDiscussionTeam(resolvedTeamId)
            } else if (isOwner) {
              await teamStore.dismissTeam(resolvedTeamId)
            } else {
              await teamStore.leaveTeam(resolvedTeamId)
            }

            await deleteTeamConversationData(resolvedConversationId)

            completed = true
            returnAfterTeamExit(navigation, resolvedConversationId)
          } catch (error) {
            conversationStore.clearTeamExitInProgress(resolvedConversationId)
            const offlineMessage = await getConfirmedOfflineMessage()
            toast.alert(
              t('commonActionFailed'),
              offlineMessage || getDisplayErrorMessage(error, t('commonRetryLater'))
            )
          } finally {
            if (completed) {
              setTimeout(() => {
                conversationStore.clearTeamExitInProgress(resolvedConversationId)
              }, 3000)
            }
          }
        }
      },
      { text: t('actionCancel'), style: 'cancel' }
    ])
  }

  if (loading && !team && members.length === 0) {
    return (
      <UIKitPage style={styles.centerState}>
        <Stack.Screen options={{ title: t('teamSettingsTitle'), headerTitleAlign: 'center' }} />
        <ActivityIndicator color="#337EFF" />
      </UIKitPage>
    )
  }

  if (loadFailed && !team && members.length === 0) {
    return (
      <UIKitPage style={styles.centerState}>
        <Stack.Screen options={{ title: t('teamSettingsTitle'), headerTitleAlign: 'center' }} />
        <ThemedText>{t('teamSettingsLoadFailed')}</ThemedText>
        <Pressable
          style={styles.retryButton}
          onPress={() => loadTeamDetails().catch(() => undefined)}
        >
          <ThemedText style={styles.retryText}>{t('commonRetry')}</ThemedText>
        </Pressable>
      </UIKitPage>
    )
  }

  const conversation = getConversationForSettings(resolvedConversationId)
  const previewMembers = members.slice(0, 7)
  const myMember = members.find((item) => item.accountId === userStore.selfProfile?.accountId)

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: t('teamSettingsTitle'), headerTitleAlign: 'center' }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Pressable
            style={styles.heroRow}
            onPress={() =>
              runWithNavigationLock(() => {
                router.push({
                  pathname: '/team/info',
                  params: { teamId: resolvedTeamId }
                } as never)
              })
            }
          >
            <UIKitUserAvatar
              account={resolvedTeamId || team?.name || t('commonGroupChat')}
              avatar={team?.avatar}
              size={56}
            />
            <View style={styles.heroMeta}>
              <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.heroTitle}>
                {team?.name || t('commonUnnamedGroupChat')}
              </ThemedText>
              <View style={styles.heroSubtitleRow}>
                <ThemedText style={styles.heroTypeBadge}>{settingsCopy.typeLabel}</ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  {t('teamSettingsGroupId', { teamId: resolvedTeamId || '-' })}
                </ThemedText>
              </View>
            </View>
            <UIKitIcon type="icon-jiantou" size={18} tintColor="#A2AAB5" />
          </Pressable>
          <UIKitRowDivider />
          <UIKitInfoRow
            label={settingsCopy.memberLabel}
            value={String(memberCount)}
            showChevron
            onPress={() =>
              runWithNavigationLock(() => {
                router.push({
                  pathname: '/team/members',
                  params: { teamId: resolvedTeamId }
                } as never)
              })
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberStrip}
          >
            {canInviteMembers ? (
              <Pressable
                style={styles.memberAddItem}
                onPress={() =>
                  runWithNavigationLock(() => {
                    router.push({
                      pathname: '/team/member-picker',
                      params: { teamId: resolvedTeamId }
                    } as never)
                  })
                }
              >
                <View style={styles.memberAddCircle}>
                  <ThemedText style={styles.memberAddText}>+</ThemedText>
                </View>
                <View style={styles.memberAddNameSpacer} />
              </Pressable>
            ) : null}
            {previewMembers.map((member) => {
              const friend = friendStore.friends.get(member.accountId)

              return (
                <Pressable
                  key={member.accountId}
                  style={styles.memberItem}
                  onPress={() =>
                    runWithNavigationLock(() => {
                      router.push({
                        pathname: '/friend/friend-card',
                        params: { accountId: member.accountId }
                      } as never)
                    })
                  }
                >
                  <UIKitUserAvatar
                    account={member.accountId}
                    avatar={friend?.userProfile?.avatar}
                    size={38}
                  />
                </Pressable>
              )
            })}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <UIKitInfoRow
            label={t('commonMessageMark')}
            value=""
            showChevron
            onPress={() =>
              runWithNavigationLock(() => {
                router.push({
                  pathname: '/chat/pins',
                  params: { conversationId: resolvedConversationId }
                } as never)
              })
            }
          />
          <UIKitRowDivider />
          <UIKitSwitchRow
            label={t('commonEnableMessageNotification')}
            value={!conversation?.mute}
            onValueChange={handleToggleMute}
          />
          <UIKitRowDivider />
          <UIKitSwitchRow
            label={t('commonChatStickTop')}
            value={!!conversation?.stickTop}
            onValueChange={handleToggleStickTop}
          />
          {!isDiscussion ? (
            <>
              <UIKitRowDivider />
              <UIKitInfoRow
                label={t('teamSettingsMyNick')}
                value={myMember?.teamNick || t('commonNotSet')}
                showChevron
                onPress={() =>
                  runWithNavigationLock(() => {
                    router.push({
                      pathname: '/team/edit',
                      params: {
                        teamId: resolvedTeamId,
                        field: 'teamNick',
                        title: t('teamSettingsMyNickEditTitle')
                      }
                    } as never)
                  })
                }
              />
            </>
          ) : null}
        </View>

        {!isDiscussion && (canManageTeam || isOwner) ? (
          <View style={styles.card}>
            {isOwner ? (
              <>
                <UIKitSwitchRow
                  label={t('teamSettingsChatBanned')}
                  value={
                    team?.chatBannedMode ===
                    V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL
                  }
                  onValueChange={handleToggleChatBanned}
                />
                {canManageTeam ? <UIKitRowDivider /> : null}
              </>
            ) : null}
            {canManageTeam ? (
              <UIKitInfoRow
                label={t('teamSettingsManage')}
                value=""
                showChevron
                onPress={() =>
                  runWithNavigationLock(() => {
                    router.push({
                      pathname: '/team/manage',
                      params: { teamId: resolvedTeamId }
                    } as never)
                  })
                }
              />
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <UIKitActionCell
            label={settingsCopy.dangerAction}
            tone="danger"
            onPress={confirmDangerAction}
          />
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16
  },
  retryButton: {
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#337EFF'
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  heroRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  heroMeta: {
    flex: 1,
    minWidth: 0
  },
  heroTitle: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600'
  },
  heroSubtitle: {
    color: '#98A1AD',
    fontSize: 13,
    lineHeight: 18
  },
  heroSubtitleRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  heroTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F2F5FA',
    color: '#69707D',
    fontSize: 12,
    lineHeight: 16
  },
  memberStrip: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 8
  },
  memberAddItem: {
    width: 44,
    alignItems: 'center'
  },
  memberAddCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#D0D8E4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  memberAddText: {
    color: '#98A1AD',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '400'
  },
  memberAddNameSpacer: {
    width: '100%',
    height: 0
  },
  memberItem: {
    width: 44,
    alignItems: 'center'
  }
})

export default TeamSettingsScreen
