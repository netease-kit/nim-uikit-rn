import * as Clipboard from 'expo-clipboard'
import * as ImagePicker from 'expo-image-picker'
import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Alert, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { UIKitInfoRow, UIKitPage, UIKitRowDivider, UIKitUserAvatar } from '@/src/NEUIKit/rn'
import { userStore } from '@/stores'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'
import { ensureCameraPermission, ensureMediaLibraryPermission } from '@/utils/permissions'

const MyDetailScreen = observer(() => {
  const profile = userStore.selfProfile
  const [avatarSheetVisible, setAvatarSheetVisible] = useState(false)
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false)
  const [birthdayDraft, setBirthdayDraft] = useState(resolveBirthdayDraft(profile?.birthday))

  const birthdayLabel = useMemo(() => formatBirthday(profile?.birthday), [profile?.birthday])
  const genderLabel = useMemo(() => formatGender(profile?.gender), [profile?.gender])

  const openBirthdayModal = () => {
    setBirthdayDraft(resolveBirthdayDraft(profile?.birthday))
    setBirthdayModalVisible(true)
  }

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(profile?.accountId || '')
      Alert.alert('复制成功', profile?.accountId || '')
    } catch (error) {
      Alert.alert('复制失败', error instanceof Error ? error.message : '账号复制失败')
    }
  }

  const handlePickAvatarFromAlbum = async () => {
    setAvatarSheetVisible(false)

    if (!(await ensureMediaLibraryPermission())) {
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1
    })

    if (result.canceled || !result.assets?.[0]?.uri) {
      return
    }

    try {
      await ensureNetworkAvailable()
      await userStore.updateAvatar(result.assets[0].uri)
    } catch (error) {
      Alert.alert('上传失败', error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE)
    }
  }

  const handleTakePhoto = async () => {
    setAvatarSheetVisible(false)

    if (!(await ensureCameraPermission())) {
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1
    })

    if (result.canceled || !result.assets?.[0]?.uri) {
      return
    }

    try {
      await ensureNetworkAvailable()
      await userStore.updateAvatar(result.assets[0].uri)
    } catch (error) {
      Alert.alert('上传失败', error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE)
    }
  }

  const handleSaveBirthday = async () => {
    const normalizedBirthday = birthdayDraft.trim()

    if (normalizedBirthday && !isValidBirthdayInput(normalizedBirthday)) {
      Alert.alert('保存失败', '请输入正确的生日，格式为 YYYY-MM-DD')
      return
    }

    setBirthdayModalVisible(false)

    try {
      await ensureNetworkAvailable()
      await userStore.updateSelfProfile({ birthday: normalizedBirthday })
    } catch (error) {
      Alert.alert('保存失败', error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE)
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: '个人信息', headerTitleAlign: 'center' }} />

      <View style={styles.card}>
        <UIKitInfoRow
          label="头像"
          value=""
          showChevron
          right={
            <UIKitUserAvatar
              account={profile?.accountId || 'me'}
              avatar={profile?.avatar}
              size={44}
            />
          }
          onPress={() => setAvatarSheetVisible(true)}
        />
        <UIKitRowDivider />
        <UIKitInfoRow
          label="昵称"
          value={profile?.name || '未设置'}
          showChevron
          onPress={() => navigateToEdit('name')}
        />
        <UIKitRowDivider />
        <UIKitInfoRow
          label="性别"
          value={genderLabel}
          showChevron
          onPress={() => router.push('/user/gender' as never)}
        />
        <UIKitRowDivider />
        <UIKitInfoRow label="生日" value={birthdayLabel} showChevron onPress={openBirthdayModal} />
        <UIKitRowDivider />
        <UIKitInfoRow
          label="手机"
          value={profile?.mobile || '未设置'}
          showChevron
          onPress={() => navigateToEdit('mobile')}
        />
        <UIKitRowDivider />
        <UIKitInfoRow
          label="邮箱"
          value={profile?.email || '未设置'}
          showChevron
          onPress={() => navigateToEdit('email')}
        />
      </View>

      <View style={styles.card}>
        <UIKitInfoRow
          label="个性签名"
          value={profile?.sign || '未设置'}
          showChevron
          onPress={() => navigateToEdit('sign')}
        />
      </View>

      <Pressable style={styles.accountCard} onPress={handleCopy}>
        <ThemedText style={styles.accountLabel}>帐号</ThemedText>
        <ThemedText style={styles.accountValue}>{profile?.accountId || '-'}</ThemedText>
      </Pressable>

      <Modal
        transparent
        visible={avatarSheetVisible}
        animationType="fade"
        onRequestClose={() => setAvatarSheetVisible(false)}
      >
        <Pressable style={styles.sheetMask} onPress={() => setAvatarSheetVisible(false)}>
          <View style={styles.sheetWrap}>
            <Pressable style={styles.sheetCard}>
              <SheetAction label="拍照" onPress={handleTakePhoto} />
              <View style={styles.sheetDivider} />
              <SheetAction label="从手机相册选择" onPress={handlePickAvatarFromAlbum} />
            </Pressable>
            <Pressable style={styles.sheetCancel} onPress={() => setAvatarSheetVisible(false)}>
              <ThemedText style={styles.sheetCancelText}>取消</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={birthdayModalVisible}
        animationType="fade"
        onRequestClose={() => setBirthdayModalVisible(false)}
      >
        <View style={styles.sheetMask}>
          <View style={styles.birthdayCard}>
            <View style={styles.birthdayHeader}>
              <Pressable onPress={() => setBirthdayModalVisible(false)}>
                <ThemedText style={styles.birthdayAction}>取消</ThemedText>
              </Pressable>
              <Pressable onPress={handleSaveBirthday}>
                <ThemedText style={styles.birthdayAction}>确认</ThemedText>
              </Pressable>
            </View>
            <TextInput
              style={styles.birthdayInput}
              value={birthdayDraft}
              onChangeText={setBirthdayDraft}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
      </Modal>
    </UIKitPage>
  )
})

function navigateToEdit(field: 'name' | 'mobile' | 'email' | 'sign') {
  const titleMap = {
    name: '昵称',
    mobile: '手机',
    email: '邮箱',
    sign: '个性签名'
  } as const

  router.push({
    pathname: '/user/my-detail-edit',
    params: {
      field,
      title: titleMap[field]
    }
  } as never)
}

function SheetAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.sheetAction} onPress={onPress}>
      <ThemedText style={styles.sheetActionText}>{label}</ThemedText>
    </Pressable>
  )
}

function formatGender(gender?: number) {
  if (gender === 1) {
    return '男'
  }
  if (gender === 2) {
    return '女'
  }
  return '未知'
}

function formatBirthday(birthday?: string) {
  if (!birthday) {
    return '未设置'
  }

  const date = new Date(birthday)

  if (Number.isNaN(date.getTime())) {
    return birthday
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function resolveBirthdayDraft(birthday?: string) {
  if (birthday) {
    const date = new Date(birthday)

    if (!Number.isNaN(date.getTime())) {
      return birthday.slice(0, 10)
    }
  }

  return formatDateInput(new Date())
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isValidBirthdayInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return false
  }

  const [year, month, day] = value.split('-').map((item) => Number(item))

  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return date.getTime() <= today.getTime()
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
    gap: 16
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  accountCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    minHeight: 68,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  accountLabel: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24
  },
  accountValue: {
    color: '#98A1AD',
    fontSize: 15,
    lineHeight: 22
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
  birthdayCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingBottom: 24
  },
  birthdayHeader: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2F7'
  },
  birthdayAction: {
    color: '#337EFF',
    fontSize: 17,
    lineHeight: 24
  },
  birthdayInput: {
    minHeight: 54,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    backgroundColor: '#F4F6FA',
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 22,
    color: '#333333'
  }
})

export default MyDetailScreen
