import * as Clipboard from 'expo-clipboard'
import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitInfoRow, UIKitPage, UIKitRowDivider, UIKitUserAvatar } from '@/src/NEUIKit/rn'
import { userStore } from '@/stores'
import * as ImagePicker from '@/utils/image-picker'
import { NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'
import { ensureCameraPermission, ensureMediaLibraryPermission } from '@/utils/permissions'

const MyDetailScreen = observer(() => {
  const { t } = useAppTranslation()
  const { runWithNavigationLock } = useNavigationLock()
  const profile = userStore.selfProfile
  const displayName = profile?.name || profile?.accountId || t('myDetailUnset')
  const [avatarSheetVisible, setAvatarSheetVisible] = useState(false)
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false)
  const [birthdayDraft, setBirthdayDraft] = useState(resolveBirthdayDraft(profile?.birthday))

  const birthdayLabel = useMemo(
    () => formatBirthday(profile?.birthday, t('myDetailUnset')),
    [profile?.birthday, t]
  )
  const genderLabel = useMemo(() => formatGender(profile?.gender, t), [profile?.gender, t])

  const openBirthdayModal = () => {
    setBirthdayDraft(resolveBirthdayDraft(profile?.birthday))
    setBirthdayModalVisible(true)
  }

  const navigateToEditField = (field: 'name' | 'mobile' | 'email' | 'sign') => {
    const titleMap = {
      name: t('profileTitleNickname'),
      mobile: t('profileTitleMobile'),
      email: t('profileTitleEmail'),
      sign: t('profileTitleSignature')
    } as const

    runWithNavigationLock(() => {
      router.push({
        pathname: '/user/my-detail-edit',
        params: {
          field,
          title: titleMap[field]
        }
      } as never)
    })
  }

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(profile?.accountId || '')
      toast.alert(t('copySuccess'), profile?.accountId || '')
    } catch (error) {
      toast.alert(t('copyFailed'), error instanceof Error ? error.message : t('myDetailCopyFailed'))
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
      await userStore.updateAvatar(result.assets[0].uri)
    } catch (error) {
      toast.alert(
        t('uploadFailed'),
        error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
      )
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
      await userStore.updateAvatar(result.assets[0].uri)
    } catch (error) {
      toast.alert(
        t('uploadFailed'),
        error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
      )
    }
  }

  const handleSaveBirthday = async () => {
    const normalizedBirthday = birthdayDraft.trim()

    if (normalizedBirthday && !isValidBirthdayInput(normalizedBirthday)) {
      toast.alert(t('saveFailed'), t('birthdayFormatError'))
      return
    }

    setBirthdayModalVisible(false)

    try {
      await userStore.updateSelfProfile({ birthday: normalizedBirthday })
    } catch (error) {
      toast.alert(
        t('saveFailed'),
        error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
      )
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: t('myDetailTitle'), headerTitleAlign: 'center' }} />

      <View style={styles.card}>
        <UIKitInfoRow
          label={t('myDetailAvatar')}
          value=""
          compact
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
          label={t('myDetailNickname')}
          value={displayName}
          valueNumberOfLines={1}
          compact
          showChevron
          onPress={() => navigateToEditField('name')}
        />
        <UIKitRowDivider />
        <UIKitInfoRow
          label={t('myDetailAccount')}
          compact
          right={
            <View style={styles.accountInlineWrap}>
              <ThemedText numberOfLines={1} style={styles.accountInlineValue}>
                {profile?.accountId || '-'}
              </ThemedText>
              <Pressable style={styles.copyButton} onPress={handleCopy}>
                <ThemedText style={styles.copyButtonText}>{t('myDetailCopy')}</ThemedText>
              </Pressable>
            </View>
          }
        />
        <UIKitRowDivider />
        <UIKitInfoRow
          label={t('myDetailGender')}
          value={genderLabel}
          valueNumberOfLines={1}
          compact
          showChevron
          onPress={() =>
            runWithNavigationLock(() => {
              router.push('/user/gender' as never)
            })
          }
        />
        <UIKitRowDivider />
        <UIKitInfoRow
          label={t('myDetailBirthday')}
          value={birthdayLabel}
          valueNumberOfLines={1}
          compact
          showChevron
          onPress={openBirthdayModal}
        />
        <UIKitRowDivider />
        <UIKitInfoRow
          label={t('myDetailMobile')}
          value={profile?.mobile || t('myDetailUnset')}
          valueNumberOfLines={1}
          compact
          showChevron
          onPress={() => navigateToEditField('mobile')}
        />
        <UIKitRowDivider />
        <UIKitInfoRow
          label={t('myDetailEmail')}
          value={profile?.email || t('myDetailUnset')}
          valueNumberOfLines={1}
          compact
          showChevron
          onPress={() => navigateToEditField('email')}
        />
      </View>

      <View style={styles.card}>
        <UIKitInfoRow
          label={t('myDetailSignature')}
          value={profile?.sign || t('myDetailUnset')}
          valueNumberOfLines={1}
          compact
          showChevron
          onPress={() => navigateToEditField('sign')}
        />
      </View>

      <Modal
        transparent
        visible={avatarSheetVisible}
        animationType="fade"
        onRequestClose={() => setAvatarSheetVisible(false)}
      >
        <Pressable style={styles.sheetMask} onPress={() => setAvatarSheetVisible(false)}>
          <View style={styles.sheetWrap}>
            <Pressable style={styles.sheetCard}>
              <SheetAction label={t('photoTake')} onPress={handleTakePhoto} />
              <View style={styles.sheetDivider} />
              <SheetAction label={t('photoChooseFromAlbum')} onPress={handlePickAvatarFromAlbum} />
            </Pressable>
            <Pressable style={styles.sheetCancel} onPress={() => setAvatarSheetVisible(false)}>
              <ThemedText style={styles.sheetCancelText}>{t('actionCancel')}</ThemedText>
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
                <ThemedText style={styles.birthdayAction}>{t('actionCancel')}</ThemedText>
              </Pressable>
              <Pressable onPress={handleSaveBirthday}>
                <ThemedText style={styles.birthdayAction}>{t('actionConfirm')}</ThemedText>
              </Pressable>
            </View>
            <BirthdayPicker value={birthdayDraft} onChange={setBirthdayDraft} t={t} />
            <ThemedText style={styles.birthdayHint}>{t('birthdayPickHint')}</ThemedText>
          </View>
        </View>
      </Modal>
    </UIKitPage>
  )
})

function BirthdayPicker({
  value,
  onChange,
  t
}: {
  value: string
  onChange: (value: string) => void
  t: ReturnType<typeof useAppTranslation>['t']
}) {
  const selected = parseBirthdayParts(value)
  const today = new Date()
  const maxYear = today.getFullYear()
  const years = buildNumberRange(maxYear, 1900)
  const maxMonth = selected.year === maxYear ? today.getMonth() + 1 : 12
  const months = buildNumberRange(1, maxMonth)
  const maxDay =
    selected.year === maxYear && selected.month === today.getMonth() + 1
      ? today.getDate()
      : getDaysInMonth(selected.year, selected.month)
  const days = buildNumberRange(1, maxDay)

  return (
    <View style={styles.birthdayPickerWrap}>
      <BirthdayPickerColumn
        label={t('birthdayYear')}
        yearLabel={t('birthdayYear')}
        values={years}
        selectedValue={selected.year}
        onSelect={(nextYear) => {
          const nextDay = Math.min(selected.day, getDaysInMonth(nextYear, selected.month))
          onChange(formatBirthdayValue(nextYear, selected.month, nextDay))
        }}
      />
      <BirthdayPickerColumn
        label={t('birthdayMonth')}
        yearLabel={t('birthdayYear')}
        values={months}
        selectedValue={selected.month}
        onSelect={(nextMonth) => {
          const nextDay = Math.min(selected.day, getDaysInMonth(selected.year, nextMonth))
          onChange(formatBirthdayValue(selected.year, nextMonth, nextDay))
        }}
      />
      <BirthdayPickerColumn
        label={t('birthdayDay')}
        yearLabel={t('birthdayYear')}
        values={days}
        selectedValue={selected.day}
        onSelect={(nextDay) => {
          onChange(formatBirthdayValue(selected.year, selected.month, nextDay))
        }}
      />
    </View>
  )
}

function BirthdayPickerColumn({
  label,
  values,
  selectedValue,
  onSelect,
  yearLabel
}: {
  label: string
  values: number[]
  selectedValue: number
  onSelect: (value: number) => void
  yearLabel: string
}) {
  return (
    <View style={styles.birthdayColumn}>
      <ThemedText style={styles.birthdayColumnLabel}>{label}</ThemedText>
      <ScrollView
        style={styles.birthdayColumnScroll}
        contentContainerStyle={styles.birthdayColumnContent}
        showsVerticalScrollIndicator={false}
      >
        {values.map((item) => {
          const selected = item === selectedValue

          return (
            <Pressable
              key={`${label}-${item}`}
              style={[styles.birthdayOption, selected && styles.birthdayOptionSelected]}
              onPress={() => onSelect(item)}
            >
              <ThemedText
                style={[styles.birthdayOptionText, selected && styles.birthdayOptionTextSelected]}
              >
                {label === yearLabel ? item : String(item).padStart(2, '0')}
              </ThemedText>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

function SheetAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.sheetAction} onPress={onPress}>
      <ThemedText style={styles.sheetActionText}>{label}</ThemedText>
    </Pressable>
  )
}

function formatGender(gender: number | undefined, t: ReturnType<typeof useAppTranslation>['t']) {
  if (gender === 1) {
    return t('genderMale')
  }
  if (gender === 2) {
    return t('genderFemale')
  }
  return t('genderUnknown')
}

function formatBirthday(birthday: string | undefined, emptyText: string) {
  if (!birthday) {
    return emptyText
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

function parseBirthdayParts(value?: string) {
  const fallback = new Date()
  const fallbackYear = fallback.getFullYear()
  const fallbackMonth = fallback.getMonth() + 1
  const fallbackDay = fallback.getDate()

  if (!value || !isValidBirthdayInput(value)) {
    return { year: fallbackYear, month: fallbackMonth, day: fallbackDay }
  }

  const [year, month, day] = value.split('-').map((item) => Number(item))
  return { year, month, day }
}

function buildNumberRange(start: number, end: number) {
  const result: number[] = []
  const step = start <= end ? 1 : -1

  for (let current = start; step > 0 ? current <= end : current >= end; current += step) {
    result.push(current)
  }

  return result
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function formatBirthdayValue(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  accountInlineWrap: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  accountInlineValue: {
    maxWidth: 148,
    color: '#98A1AD',
    fontSize: 15,
    lineHeight: 22
  },
  copyButton: {
    minWidth: 44,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  copyButtonText: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 18
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
  birthdayPickerWrap: {
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    gap: 12
  },
  birthdayColumn: {
    flex: 1
  },
  birthdayColumnLabel: {
    marginBottom: 10,
    color: '#98A1AD',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center'
  },
  birthdayColumnScroll: {
    maxHeight: 240,
    borderRadius: 18,
    backgroundColor: '#F4F6FA'
  },
  birthdayColumnContent: {
    paddingVertical: 10
  },
  birthdayOption: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderRadius: 14
  },
  birthdayOptionSelected: {
    backgroundColor: '#337EFF'
  },
  birthdayOptionText: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 22
  },
  birthdayOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  birthdayHint: {
    marginHorizontal: 20,
    marginTop: 14,
    color: '#98A1AD',
    fontSize: 13,
    lineHeight: 18
  }
})

export default MyDetailScreen
