import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import {
  getUIKitAppellation,
  UIKitActionCell,
  UIKitIcon,
  UIKitInfoRow,
  UIKitPage,
  UIKitRowDivider,
  UIKitSwitchRow,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import { conversationStore, friendStore, teamStore, userStore } from '@/stores'
import {
  V2NIMTeamAgreeMode,
  V2NIMTeamChatBannedMode,
  V2NIMTeamInviteMode,
  V2NIMTeamMemberRole,
  V2NIMTeamUpdateInfoMode
} from '@/utils/nim-sdk'

function getInviteModeLabel(inviteMode?: number) {
  return inviteMode === V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL ? '所有人' : '群主/管理员'
}

function getUpdateInfoModeLabel(updateInfoMode?: number) {
  return updateInfoMode === V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
    ? '所有人'
    : '群主/管理员'
}

function getAgreeModeLabel(agreeMode?: number) {
  return agreeMode === V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH ? '不需要' : '需要'
}

const TeamSettingsScreen = observer(() => {
  const { teamId, conversationId } = useLocalSearchParams<{
    teamId?: string
    conversationId?: string
  }>()
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const team = teamStore.getTeam(resolvedTeamId)
  const members = teamStore.getMembers(resolvedTeamId)
  const myRole = teamStore.getMyMemberRole(resolvedTeamId)
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  const canManageTeam = myRole !== V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL
  const isOwner = myRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
  const canInviteMembers =
    canManageTeam || team?.inviteMode === V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL

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
      Alert.alert('加载失败', error instanceof Error ? error.message : '群设置加载失败')
    } finally {
      setLoading(false)
    }
  }, [resolvedTeamId])

  useEffect(() => {
    loadTeamDetails().catch(() => undefined)
  }, [loadTeamDetails])

  const handleToggleMute = async (value: boolean) => {
    try {
      await conversationStore.toggleMute(resolvedConversationId, !value)
    } catch (error) {
      Alert.alert('设置失败', error instanceof Error ? error.message : '请稍后重试')
    }
  }

  const handleToggleStickTop = async (value: boolean) => {
    try {
      await conversationStore.toggleStickTop(resolvedConversationId, value)
    } catch (error) {
      Alert.alert('设置失败', error instanceof Error ? error.message : '请稍后重试')
    }
  }

  const handleToggleChatBanned = async (value: boolean) => {
    try {
      await teamStore.updateTeamInfo(resolvedTeamId, {
        chatBannedMode: value
          ? V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL
          : V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
      })
    } catch (error) {
      Alert.alert('设置失败', error instanceof Error ? error.message : '请稍后重试')
    }
  }

  const updateTeamMeta = async (params: Record<string, number>) => {
    try {
      await teamStore.updateTeamInfo(resolvedTeamId, params)
    } catch (error) {
      Alert.alert('设置失败', error instanceof Error ? error.message : '请稍后重试')
    }
  }

  const openInviteModePicker = () => {
    if (!canManageTeam) {
      return
    }

    Alert.alert('邀请他人权限', undefined, [
      {
        text: '群主/管理员',
        onPress: () =>
          updateTeamMeta({
            inviteMode: V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER
          }).catch(() => undefined)
      },
      {
        text: '所有人',
        onPress: () =>
          updateTeamMeta({
            inviteMode: V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
          }).catch(() => undefined)
      },
      { text: '取消', style: 'cancel' }
    ])
  }

  const openUpdateInfoModePicker = () => {
    if (!canManageTeam) {
      return
    }

    Alert.alert('群资料修改权限', undefined, [
      {
        text: '群主/管理员',
        onPress: () =>
          updateTeamMeta({
            updateInfoMode: V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER
          }).catch(() => undefined)
      },
      {
        text: '所有人',
        onPress: () =>
          updateTeamMeta({
            updateInfoMode: V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
          }).catch(() => undefined)
      },
      { text: '取消', style: 'cancel' }
    ])
  }

  const openAgreeModePicker = () => {
    if (!canManageTeam) {
      return
    }

    Alert.alert('是否需要被邀请者同意', undefined, [
      {
        text: '需要',
        onPress: () =>
          updateTeamMeta({
            agreeMode: V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_AUTH
          }).catch(() => undefined)
      },
      {
        text: '不需要',
        onPress: () =>
          updateTeamMeta({
            agreeMode: V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH
          }).catch(() => undefined)
      },
      { text: '取消', style: 'cancel' }
    ])
  }

  const confirmDangerAction = () => {
    Alert.alert(
      isOwner ? '解散群聊' : '退出群聊',
      isOwner ? '确认解散当前群聊？' : '确认退出当前群聊？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isOwner) {
                await teamStore.dismissTeam(resolvedTeamId)
              } else {
                await teamStore.leaveTeam(resolvedTeamId)
              }

              router.replace('/(tabs)/contacts' as never)
            } catch (error) {
              Alert.alert('操作失败', error instanceof Error ? error.message : '请稍后重试')
            }
          }
        }
      ]
    )
  }

  if (loading && !team && members.length === 0) {
    return (
      <UIKitPage style={styles.centerState}>
        <Stack.Screen options={{ title: '设置', headerTitleAlign: 'center' }} />
        <ActivityIndicator color="#337EFF" />
      </UIKitPage>
    )
  }

  if (loadFailed && !team && members.length === 0) {
    return (
      <UIKitPage style={styles.centerState}>
        <Stack.Screen options={{ title: '设置', headerTitleAlign: 'center' }} />
        <ThemedText>群设置加载失败</ThemedText>
        <Pressable
          style={styles.retryButton}
          onPress={() => loadTeamDetails().catch(() => undefined)}
        >
          <ThemedText style={styles.retryText}>重试</ThemedText>
        </Pressable>
      </UIKitPage>
    )
  }

  const conversation = conversationStore.getConversation(resolvedConversationId)
  const previewMembers = members.slice(0, 7)
  const memberCount = team?.memberCount || members.length
  const myMember = members.find((item) => item.accountId === userStore.selfProfile?.accountId)

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: '设置', headerTitleAlign: 'center' }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.heroRow}>
            <UIKitUserAvatar
              account={resolvedTeamId || team?.name || '群聊'}
              avatar={team?.avatar}
              size={64}
            />
            <View style={styles.heroMeta}>
              <ThemedText style={styles.heroTitle}>{team?.name || '未命名群聊'}</ThemedText>
              <ThemedText style={styles.heroSubtitle}>群号：{resolvedTeamId || '-'}</ThemedText>
            </View>
            {canManageTeam ? (
              <Pressable
                style={styles.roundAddButton}
                onPress={() =>
                  router.push({
                    pathname: '/team/member-picker',
                    params: { teamId: resolvedTeamId }
                  } as never)
                }
              >
                <UIKitIcon type="icon-tianjiahaoyou" size={22} tintColor="#B7C0CC" />
              </Pressable>
            ) : null}
          </View>
          <UIKitRowDivider />
          <UIKitInfoRow
            label="群成员"
            value={String(memberCount)}
            showChevron
            onPress={() =>
              router.push({
                pathname: '/team/members',
                params: { teamId: resolvedTeamId }
              } as never)
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
                  router.push({
                    pathname: '/team/member-picker',
                    params: { teamId: resolvedTeamId }
                  } as never)
                }
              >
                <View style={styles.memberAddCircle}>
                  <UIKitIcon type="icon-tianjiahaoyou" size={22} tintColor="#BCC5D1" />
                </View>
              </Pressable>
            ) : null}
            {previewMembers.map((member) => {
              const friend = friendStore.friends.get(member.accountId)
              const name =
                getUIKitAppellation({
                  account: member.accountId,
                  teamId: resolvedTeamId
                }) || member.accountId

              return (
                <Pressable
                  key={member.accountId}
                  style={styles.memberItem}
                  onPress={() =>
                    router.push({
                      pathname: '/friend/friend-card',
                      params: { accountId: member.accountId }
                    } as never)
                  }
                >
                  <UIKitUserAvatar
                    account={member.accountId}
                    avatar={friend?.userProfile?.avatar}
                    size={56}
                  />
                  <ThemedText numberOfLines={1} style={styles.memberName}>
                    {name}
                  </ThemedText>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <UIKitInfoRow
            label="群名称"
            value={team?.name || '未设置'}
            showChevron={canManageTeam}
            onPress={
              canManageTeam
                ? () =>
                    router.push({
                      pathname: '/team/edit',
                      params: { teamId: resolvedTeamId, field: 'name', title: '群名称' }
                    } as never)
                : undefined
            }
          />
          <UIKitRowDivider />
          <UIKitInfoRow
            label="群介绍"
            value={team?.intro || '未设置'}
            showChevron={canManageTeam}
            onPress={
              canManageTeam
                ? () =>
                    router.push({
                      pathname: '/team/edit',
                      params: { teamId: resolvedTeamId, field: 'intro', title: '群介绍' }
                    } as never)
                : undefined
            }
          />
          <UIKitRowDivider />
          <UIKitInfoRow
            label="我的群昵称"
            value={myMember?.teamNick || '未设置'}
            showChevron
            onPress={() =>
              router.push({
                pathname: '/team/edit',
                params: { teamId: resolvedTeamId, field: 'teamNick', title: '我在群里的昵称' }
              } as never)
            }
          />
          <UIKitRowDivider />
          <UIKitInfoRow
            label="群头像"
            value=""
            showChevron={canManageTeam}
            right={
              <UIKitUserAvatar
                account={resolvedTeamId || team?.name || '群聊'}
                avatar={team?.avatar}
                size={38}
              />
            }
            onPress={
              canManageTeam
                ? () =>
                    router.push({
                      pathname: '/team/edit',
                      params: { teamId: resolvedTeamId, field: 'avatar', title: '修改头像' }
                    } as never)
                : undefined
            }
          />
        </View>

        <View style={styles.card}>
          <UIKitInfoRow
            label="标记"
            value=""
            showChevron
            onPress={() =>
              router.push({
                pathname: '/chat/pins',
                params: { conversationId: resolvedConversationId }
              } as never)
            }
          />
          <UIKitRowDivider />
          <UIKitInfoRow
            label="历史记录"
            value=""
            showChevron
            onPress={() =>
              router.push({
                pathname: '/chat/history',
                params: {
                  conversationId: resolvedConversationId,
                  title: team?.name || resolvedTeamId
                }
              } as never)
            }
          />
          <UIKitRowDivider />
          <UIKitSwitchRow
            label="开启消息提醒"
            value={!conversation?.mute}
            onValueChange={handleToggleMute}
          />
          <UIKitRowDivider />
          <UIKitSwitchRow
            label="聊天置顶"
            value={!!conversation?.stickTop}
            onValueChange={handleToggleStickTop}
          />
        </View>

        <View style={styles.card}>
          {canManageTeam ? (
            <UIKitSwitchRow
              label="群禁言"
              value={
                team?.chatBannedMode ===
                V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL
              }
              onValueChange={handleToggleChatBanned}
            />
          ) : (
            <UIKitInfoRow
              label="群禁言"
              value={
                team?.chatBannedMode ===
                V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL
                  ? '已开启'
                  : '已关闭'
              }
            />
          )}
        </View>

        <View style={styles.card}>
          <UIKitInfoRow
            label="邀请他人权限"
            value={getInviteModeLabel(team?.inviteMode)}
            showChevron={canManageTeam}
            onPress={canManageTeam ? openInviteModePicker : undefined}
          />
          <UIKitRowDivider />
          <UIKitInfoRow
            label="群资料修改权限"
            value={getUpdateInfoModeLabel(team?.updateInfoMode)}
            showChevron={canManageTeam}
            onPress={canManageTeam ? openUpdateInfoModePicker : undefined}
          />
          <UIKitRowDivider />
          <UIKitInfoRow
            label="是否需要被邀请者同意"
            value={getAgreeModeLabel(team?.agreeMode)}
            showChevron={canManageTeam}
            onPress={canManageTeam ? openAgreeModePicker : undefined}
          />
        </View>

        <View style={styles.card}>
          <UIKitActionCell
            label={isOwner ? '解散群聊' : '退出群聊'}
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
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  heroMeta: {
    flex: 1
  },
  heroTitle: {
    color: '#333333',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600'
  },
  heroSubtitle: {
    marginTop: 8,
    color: '#98A1AD',
    fontSize: 15,
    lineHeight: 22
  },
  roundAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#D0D8E4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  memberStrip: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 18,
    gap: 12
  },
  memberAddItem: {
    alignItems: 'center'
  },
  memberAddCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#D0D8E4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  memberItem: {
    width: 64,
    alignItems: 'center',
    gap: 8
  },
  memberName: {
    width: '100%',
    color: '#7E8794',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center'
  }
})

export default TeamSettingsScreen
