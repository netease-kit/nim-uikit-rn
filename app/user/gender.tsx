import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitHeaderBackButton, UIKitPage } from '@/src/NEUIKit/rn'
import { userStore } from '@/stores'
import { NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'

const GenderScreen = observer(() => {
  const { t } = useAppTranslation()
  const currentGender = userStore.selfProfile?.gender ?? 0
  const [selectedValue, setSelectedValue] = useState(currentGender)
  const options = [
    { label: t('genderUnknown'), value: 0 },
    { label: t('genderMale'), value: 1 },
    { label: t('genderFemale'), value: 2 }
  ] as const

  const handleBack = async () => {
    if (selectedValue === currentGender) {
      router.back()
      return
    }

    router.back()

    try {
      await userStore.updateSelfProfile({ gender: selectedValue || undefined })
    } catch (error) {
      toast.alert(
        t('saveFailed'),
        error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
      )
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen
        options={{
          title: t('genderTitle'),
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'minimal',
          headerLeft: () => <UIKitHeaderBackButton onPress={() => void handleBack()} />
        }}
      />

      <View style={styles.card}>
        {options.map((option, index) => {
          const selected = selectedValue === option.value

          return (
            <Pressable
              key={option.value}
              style={[styles.row, index === options.length - 1 && styles.rowLast]}
              onPress={() => setSelectedValue(option.value)}
            >
              <ThemedText style={styles.rowText}>{option.label}</ThemedText>
              <ThemedText style={[styles.checkmark, !selected && styles.checkmarkHidden]}>
                ✓
              </ThemedText>
            </Pressable>
          )
        })}
      </View>
    </UIKitPage>
  )
})

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#EEF2F7'
  },
  card: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  row: {
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2F7'
  },
  rowLast: {
    borderBottomWidth: 0
  },
  rowText: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24
  },
  checkmark: {
    color: '#337EFF',
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '700'
  },
  checkmarkHidden: {
    opacity: 0
  }
})

export default GenderScreen
