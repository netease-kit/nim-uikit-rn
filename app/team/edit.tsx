import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitAvatar,
  UIKitIcon,
  UIKitPage,
  UIKitTextInput,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import { nimStore, teamStore } from '@/stores'
import { DEFAULT_TEAM_AVATARS } from '@/stores/TeamStore'
import * as ImagePicker from '@/utils/image-picker'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'
import { V2NIMTeamMemberRole, V2NIMTeamUpdateInfoMode } from '@/utils/nim-sdk'
import { ensureCameraPermission, ensureMediaLibraryPermission } from '@/utils/permissions'

const fieldConfig = {
  name: { placeholderKey: 'teamTitlePlaceholder', maxLength: 30 },
  intro: { placeholderKey: 'teamEditIntroPlaceholder', maxLength: 100 },
  teamNick: { placeholderKey: 'teamEditNickPlaceholder', maxLength: 30 }
} as const

function isLocalAvatarUri(uri: string) {
  return /^file:|^content:|^ph:/i.test(uri)
}

const TeamEditScreen = observer(() => {
  const { t } = useAppTranslation()
  const { teamId, field, title } = useLocalSearchParams<{
    teamId?: string
    field?: 'name' | 'intro' | 'teamNick' | 'avatar'
    title?: string
  }>()
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const resolvedField = typeof field === 'string' ? field : 'name'
  const resolvedTitle = typeof title === 'string' ? title : t('commonEdit')
  const team = teamStore.getTeam(resolvedTeamId)
  const currentAccountId = nimStore.getLoginUser()
  const member = teamStore
    .getMembers(resolvedTeamId)
    .find((item) => item.accountId === currentAccountId)

  const initialValue = useMemo(() => {
    if (resolvedField === 'name') {
      return team?.name || ''
    }
    if (resolvedField === 'intro') {
      return team?.intro || ''
    }
    if (resolvedField === 'teamNick') {
      return member?.teamNick || ''
    }
    return ''
  }, [member?.teamNick, resolvedField, team?.intro, team?.name])
  const [value, setValue] = useState(initialValue)
  const [avatarUri, setAvatarUri] = useState(team?.avatar || '')
  const [avatarSheetVisible, setAvatarSheetVisible] = useState(false)
  const canEditTeamInfo =
    team?.updateInfoMode === V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL ||
    member?.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER ||
    member?.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
  const canSaveTextField = resolvedField !== 'name' || value.trim().length > 0
  const textSaveLabel =
    resolvedField === 'name' || resolvedField === 'intro' || resolvedField === 'teamNick'
      ? t('actionSave')
      : t('actionDone')

  const handleSave = async () => {
    if (!canSaveTextField) {
      return
    }

    try {
      await ensureNetworkAvailable()

      if (resolvedField === 'name') {
        await teamStore.updateTeamInfo(resolvedTeamId, { name: value.trim() })
      } else if (resolvedField === 'intro') {
        await teamStore.updateTeamInfo(resolvedTeamId, { intro: value.trim() })
      } else if (resolvedField === 'teamNick') {
        await teamStore.updateMyNick(resolvedTeamId, value.trim())
      }

      router.back()
    } catch (error) {
      toast.alert(
        t('saveFailed'),
        error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
      )
    }
  }

  const handlePickAvatar = async () => {
    setAvatarSheetVisible(false)

    if (!(await ensureMediaLibraryPermission())) {
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1
    })

    if (result.canceled || !result.assets?.[0]?.uri) {
      return
    }

    setAvatarUri(result.assets[0].uri)
  }

  const handleTakePhoto = async () => {
    setAvatarSheetVisible(false)

    if (!(await ensureCameraPermission())) {
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1
    })

    if (result.canceled || !result.assets?.[0]?.uri) {
      return
    }

    setAvatarUri(result.assets[0].uri)
  }

  const handleSaveAvatar = async () => {
    try {
      await ensureNetworkAvailable()
      if (isLocalAvatarUri(avatarUri)) {
        await teamStore.updateTeamAvatar(resolvedTeamId, avatarUri)
      } else {
        await teamStore.updateTeamInfo(resolvedTeamId, { avatar: avatarUri })
      }
      router.back()
    } catch (error) {
      toast.alert(
        t('saveFailed'),
        error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
      )
    }
  }

  if (resolvedField === 'avatar') {
    return (
      <UIKitPage style={styles.page}>
        <Stack.Screen
          options={{
            title: t('teamEditAvatarTitle'),
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Pressable onPress={() => router.back()}>
                <ThemedText style={styles.headerCancel}>{t('actionCancel')}</ThemedText>
              </Pressable>
            ),
            headerRight: canEditTeamInfo
              ? () => (
                  <Pressable onPress={handleSaveAvatar}>
                    <ThemedText style={styles.headerAction}>{t('actionSave')}</ThemedText>
                  </Pressable>
                )
              : undefined
          }}
        />
        <View style={styles.avatarCard}>
          <Pressable
            disabled={!canEditTeamInfo}
            style={styles.avatarPicker}
            onPress={() => setAvatarSheetVisible(true)}
          >
            <UIKitUserAvatar
              account={resolvedTeamId || team?.name || t('commonGroupChat')}
              avatar={avatarUri}
              size={108}
            />
            {canEditTeamInfo ? (
              <View style={styles.cameraBadge}>
                <UIKitIcon type="icon-paishe" size={18} />
              </View>
            ) : null}
          </Pressable>
        </View>

        {canEditTeamInfo ? (
          <View style={styles.defaultAvatarCard}>
            <ThemedText style={styles.defaultAvatarTitle}>{t('chooseDefaultImage')}</ThemedText>
            <View style={styles.defaultAvatarGrid}>
              {DEFAULT_TEAM_AVATARS.map((item) => {
                const selected = avatarUri === item

                return (
                  <Pressable
                    key={item}
                    style={[styles.defaultAvatarOption, selected && styles.defaultAvatarSelected]}
                    onPress={() => setAvatarUri(item)}
                  >
                    <UIKitAvatar uri={item} label={t('commonGroupChat')} size={44} />
                  </Pressable>
                )
              })}
            </View>
          </View>
        ) : null}

        {canEditTeamInfo ? (
          <Modal
            transparent
            visible={avatarSheetVisible}
            animationType="fade"
            onRequestClose={() => setAvatarSheetVisible(false)}
          >
            <Pressable style={styles.sheetMask} onPress={() => setAvatarSheetVisible(false)}>
              <View style={styles.sheetWrap}>
                <Pressable style={styles.sheetCard}>
                  <AvatarSheetAction label={t('photoTake')} onPress={handleTakePhoto} />
                  <View style={styles.sheetDivider} />
                  <AvatarSheetAction label={t('photoChooseFromAlbum')} onPress={handlePickAvatar} />
                </Pressable>
                <Pressable style={styles.sheetCancel} onPress={() => setAvatarSheetVisible(false)}>
                  <ThemedText style={styles.sheetCancelText}>{t('actionCancel')}</ThemedText>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        ) : null}
      </UIKitPage>
    )
  }

  const config = fieldConfig[resolvedField as keyof typeof fieldConfig]

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen
        options={{
          title: resolvedTitle,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <ThemedText style={styles.headerCancel}>{t('actionCancel')}</ThemedText>
            </Pressable>
          ),
          headerRight:
            resolvedField === 'name' || resolvedField === 'intro'
              ? canEditTeamInfo
                ? () => (
                    <Pressable disabled={!canSaveTextField} onPress={handleSave}>
                      <ThemedText
                        style={[styles.headerAction, !canSaveTextField && styles.headerDisabled]}
                      >
                        {textSaveLabel}
                      </ThemedText>
                    </Pressable>
                  )
                : undefined
              : () => (
                  <Pressable disabled={!canSaveTextField} onPress={handleSave}>
                    <ThemedText
                      style={[styles.headerAction, !canSaveTextField && styles.headerDisabled]}
                    >
                      {textSaveLabel}
                    </ThemedText>
                  </Pressable>
                )
        }}
      />

      <View
        style={[
          styles.inputCard,
          resolvedField === 'name' && styles.inputCardMultiline,
          resolvedField === 'intro' && styles.inputCardMultiline
        ]}
      >
        <UIKitTextInput
          value={value}
          onChangeText={setValue}
          placeholder={config ? t(config.placeholderKey) : undefined}
          maxLength={config?.maxLength}
          multiline={resolvedField === 'intro' || resolvedField === 'name'}
          style={[
            styles.input,
            resolvedField === 'name' && styles.inputName,
            resolvedField === 'intro' && styles.inputTall
          ]}
        />
        {value ? (
          <Pressable
            style={[
              styles.clearButton,
              (resolvedField === 'name' || resolvedField === 'intro') && styles.clearButtonTopLine
            ]}
            onPress={() => setValue('')}
          >
            <ThemedText style={styles.clearText}>×</ThemedText>
          </Pressable>
        ) : null}
      </View>

      <ThemedText style={styles.counterText}>
        {value.length}/{config?.maxLength || 0}
      </ThemedText>
    </UIKitPage>
  )
})

function AvatarSheetAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.sheetAction} onPress={onPress}>
      <ThemedText style={styles.sheetActionText}>{label}</ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16
  },
  headerAction: {
    color: '#337EFF',
    fontWeight: '700'
  },
  headerDisabled: {
    color: '#B7BDC7'
  },
  headerCancel: {
    color: '#333333',
    fontWeight: '500'
  },
  avatarCard: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center'
  },
  avatarPicker: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3
  },
  defaultAvatarCard: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  defaultAvatarTitle: {
    color: '#1F2734',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600'
  },
  defaultAvatarGrid: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  defaultAvatarOption: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  defaultAvatarSelected: {
    borderColor: '#337EFF',
    backgroundColor: '#EAF2FF'
  },
  sheetMask: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
    padding: 16
  },
  sheetWrap: {
    gap: 10
  },
  sheetCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  sheetAction: {
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetActionText: {
    color: '#333333',
    fontSize: 18,
    lineHeight: 26
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#EEF2F7'
  },
  sheetCancel: {
    minHeight: 62,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetCancelText: {
    color: '#333333',
    fontSize: 18,
    lineHeight: 26
  },
  inputCard: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 14
  },
  inputCardMultiline: {
    alignItems: 'flex-start'
  },
  input: {
    flex: 1,
    minHeight: 68,
    fontSize: 17,
    lineHeight: 24,
    paddingHorizontal: 20,
    color: '#333333'
  },
  inputName: {
    minHeight: 92,
    paddingTop: 18,
    paddingBottom: 18,
    textAlignVertical: 'top'
  },
  inputTall: {
    minHeight: 148,
    paddingTop: 18,
    paddingBottom: 18,
    textAlignVertical: 'top'
  },
  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#B7BDC7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearButtonTopLine: {
    marginTop: 15
  },
  clearText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '700'
  },
  counterText: {
    marginTop: 10,
    alignSelf: 'flex-end',
    color: '#98A1AD',
    fontSize: 13,
    lineHeight: 18
  }
})

export default TeamEditScreen
