import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { UIKitPage } from '@/src/NEUIKit/rn'
import { preferenceStore } from '@/stores'
import { APP_LANGUAGE_OPTIONS } from '@/utils/app-language'

const LanguageScreen = observer(() => {
  const { t } = useAppTranslation()
  const initialValue =
    preferenceStore.preferences.language === 'zh' || preferenceStore.preferences.language === 'en'
      ? preferenceStore.preferences.language
      : 'zh'
  const [selectedValue, setSelectedValue] = useState<'zh' | 'en'>(initialValue)

  const handleSave = async () => {
    await preferenceStore.updatePreference('language', selectedValue)
    router.back()
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen
        options={{
          title: t('languageTitle'),
          headerTitleAlign: 'center',
          headerRight: () => (
            <Pressable onPress={() => void handleSave()}>
              <ThemedText style={styles.saveText}>{t('actionSave')}</ThemedText>
            </Pressable>
          )
        }}
      />

      <View style={styles.card}>
        {APP_LANGUAGE_OPTIONS.map((option, index) => {
          const selected = selectedValue === option.value

          return (
            <Pressable
              key={option.value}
              style={[styles.row, index === APP_LANGUAGE_OPTIONS.length - 1 && styles.rowLast]}
              onPress={() => setSelectedValue(option.value)}
            >
              <ThemedText style={styles.rowText}>{t(option.labelKey)}</ThemedText>
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
  saveText: {
    color: '#337EFF',
    fontSize: 17,
    lineHeight: 24
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

export default LanguageScreen
