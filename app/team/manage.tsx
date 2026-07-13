import { Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitInfoRow, UIKitPage, UIKitRowDivider } from '@/src/NEUIKit/rn'
import { teamStore } from '@/stores'
import { V2NIMTeamInviteMode, V2NIMTeamMemberRole, V2NIMTeamUpdateInfoMode } from '@/utils/nim-sdk'

const ALLOW_AT_EXTENSION_KEY = 'yxAllowAt'

function getUpdateInfoModeLabel(
  t: ReturnType<typeof useAppTranslation>['t'],
  updateInfoMode?: number
) {
  return updateInfoMode === V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
    ? t('teamSettingsInviteModeAll')
    : t('teamSettingsInviteModeManager')
}

function getInviteModeLabel(t: ReturnType<typeof useAppTranslation>['t'], inviteMode?: number) {
  return inviteMode === V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
    ? t('teamSettingsInviteModeAll')
    : t('teamSettingsInviteModeOwnerAndManager')
}

function getAllowAtMode(teamServerExtension?: string) {
  if (!teamServerExtension) {
    return 'all'
  }

  try {
    const parsed = JSON.parse(teamServerExtension) as Record<string, unknown>
    return parsed[ALLOW_AT_EXTENSION_KEY] === 'manager' ? 'manager' : 'all'
  } catch {
    return 'all'
  }
}

function getAllowAtModeLabel(
  t: ReturnType<typeof useAppTranslation>['t'],
  teamServerExtension?: string
) {
  return getAllowAtMode(teamServerExtension) === 'manager'
    ? t('teamSettingsInviteModeManager')
    : t('teamSettingsInviteModeAll')
}

const TeamManageScreen = observer(() => {
  const { t } = useAppTranslation()
  const { teamId } = useLocalSearchParams<{ teamId?: string }>()
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const team = teamStore.getTeam(resolvedTeamId)
  const canManageTeam =
    teamStore.getMyMemberRole(resolvedTeamId) !== V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL

  const updateTeamMeta = async (params: Record<string, number | string>) => {
    try {
      await teamStore.updateTeamInfo(resolvedTeamId, params)
    } catch (error) {
      toast.alert(
        t('settingsUpdateFailed'),
        error instanceof Error ? error.message : t('commonRetryLater')
      )
    }
  }

  const openInviteModePicker = () => {
    if (!canManageTeam) {
      return
    }

    Alert.alert(t('teamSettingsAddMemberMode'), undefined, [
      {
        text: t('teamSettingsInviteModeOwnerAndManager'),
        onPress: () =>
          updateTeamMeta({
            inviteMode: V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER
          }).catch(() => undefined)
      },
      {
        text: t('teamSettingsInviteModeAll'),
        onPress: () =>
          updateTeamMeta({
            inviteMode: V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
          }).catch(() => undefined)
      },
      { text: t('actionCancel'), style: 'cancel' }
    ])
  }

  const openUpdateInfoModePicker = () => {
    if (!canManageTeam) {
      return
    }

    Alert.alert(t('teamSettingsUpdateInfoMode'), undefined, [
      {
        text: t('teamSettingsInviteModeManager'),
        onPress: () =>
          updateTeamMeta({
            updateInfoMode: V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER
          }).catch(() => undefined)
      },
      {
        text: t('teamSettingsInviteModeAll'),
        onPress: () =>
          updateTeamMeta({
            updateInfoMode: V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
          }).catch(() => undefined)
      },
      { text: t('actionCancel'), style: 'cancel' }
    ])
  }

  const openAllowAtModePicker = () => {
    if (!canManageTeam) {
      return
    }

    Alert.alert(t('updateTeamAtText'), undefined, [
      {
        text: t('teamSettingsInviteModeManager'),
        onPress: () => {
          let ext: Record<string, unknown> = {}
          try {
            ext = JSON.parse(team?.serverExtension || '{}') as Record<string, unknown>
          } catch {
            ext = {}
          }
          ext[ALLOW_AT_EXTENSION_KEY] = 'manager'
          updateTeamMeta({ serverExtension: JSON.stringify(ext) }).catch(() => undefined)
        }
      },
      {
        text: t('teamSettingsInviteModeAll'),
        onPress: () => {
          let ext: Record<string, unknown> = {}
          try {
            ext = JSON.parse(team?.serverExtension || '{}') as Record<string, unknown>
          } catch {
            ext = {}
          }
          ext[ALLOW_AT_EXTENSION_KEY] = 'all'
          updateTeamMeta({ serverExtension: JSON.stringify(ext) }).catch(() => undefined)
        }
      },
      { text: t('actionCancel'), style: 'cancel' }
    ])
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: t('teamSettingsManage'), headerTitleAlign: 'center' }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <UIKitInfoRow
            label={t('teamSettingsUpdateInfoMode')}
            value={getUpdateInfoModeLabel(t, team?.updateInfoMode)}
            showChevron
            onPress={openUpdateInfoModePicker}
          />
          <UIKitRowDivider />
          <UIKitInfoRow
            label={t('teamSettingsAddMemberMode')}
            value={getInviteModeLabel(t, team?.inviteMode)}
            showChevron
            onPress={openInviteModePicker}
          />
          <UIKitRowDivider />
          <UIKitInfoRow
            label={t('updateTeamAtText')}
            value={getAllowAtModeLabel(t, team?.serverExtension)}
            showChevron
            onPress={openAllowAtModePicker}
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
    padding: 16
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  }
})

export default TeamManageScreen
