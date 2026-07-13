import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitTextInput } from '@/src/NEUIKit/rn'
import { userStore } from '@/stores'
import { NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'

type FieldConfig = {
  maxLength: number
  keyboardType: 'default' | 'number-pad' | 'email-address'
  placeholder: string
  multiline?: boolean
}

const MyDetailEditScreen = observer(() => {
  const { t } = useAppTranslation()
  const { field, title } = useLocalSearchParams<{ field?: string; title?: string }>()
  const resolvedField = typeof field === 'string' ? field : 'name'
  const resolvedTitle = typeof title === 'string' ? title : t('commonEdit')
  const fieldConfig: Record<'name' | 'mobile' | 'email' | 'sign', FieldConfig> = {
    name: { maxLength: 15, keyboardType: 'default', placeholder: t('editPlaceholderNickname') },
    mobile: { maxLength: 11, keyboardType: 'number-pad', placeholder: t('editPlaceholderMobile') },
    email: {
      maxLength: 30,
      keyboardType: 'email-address',
      placeholder: t('editPlaceholderEmail')
    },
    sign: {
      maxLength: 50,
      keyboardType: 'default',
      placeholder: t('editPlaceholderSignature'),
      multiline: true
    }
  }
  const config = fieldConfig[resolvedField as keyof typeof fieldConfig] || fieldConfig.name
  const profileValue =
    userStore.selfProfile?.[resolvedField as keyof NonNullable<typeof userStore.selfProfile>]
  const nameFallbackValue =
    resolvedField === 'name' && !profileValue ? userStore.selfProfile?.accountId || '' : null
  const [value, setValue] = useState(String(nameFallbackValue ?? profileValue ?? ''))
  const canClear = useMemo(() => value.length > 0, [value.length])

  const handleSave = async () => {
    const trimmedValue = resolvedField === 'sign' ? value : value.trim()
    const normalizedValue =
      resolvedField === 'name' &&
      !profileValue &&
      trimmedValue === (userStore.selfProfile?.accountId || '')
        ? ''
        : trimmedValue

    if (resolvedField === 'mobile' && normalizedValue && !/^\d{1,11}$/.test(normalizedValue)) {
      toast.alert(t('saveFailed'), t('mobileFormatError'))
      return
    }

    if (
      resolvedField === 'email' &&
      normalizedValue &&
      (!normalizedValue.includes('@') ||
        (!normalizedValue.includes('.com') && !normalizedValue.includes('.cn')))
    ) {
      toast.alert(t('saveFailed'), t('emailFormatError'))
      return
    }

    try {
      await userStore.updateSelfProfile({ [resolvedField]: normalizedValue } as never)
      router.back()
    } catch (error) {
      toast.alert(
        t('saveFailed'),
        error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
      )
    }
  }

  return (
    <View style={styles.page}>
      <Stack.Screen
        options={{
          title: resolvedTitle,
          headerTitleAlign: 'center',
          headerRight: () => (
            <Pressable onPress={() => void handleSave()}>
              <ThemedText style={styles.saveText}>{t('actionDone')}</ThemedText>
            </Pressable>
          )
        }}
      />

      <View style={styles.inputCard}>
        <UIKitTextInput
          value={value}
          onChangeText={setValue}
          placeholder={config.placeholder}
          maxLength={config.maxLength}
          keyboardType={config.keyboardType}
          multiline={!!config.multiline}
          style={[styles.input, config.multiline && styles.inputTall]}
        />
        {canClear ? (
          <TouchableOpacity style={styles.clearButton} onPress={() => setValue('')}>
            <ThemedText style={styles.clearText}>×</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>

      <ThemedText style={styles.counterText}>
        {value.length}/{config.maxLength}
      </ThemedText>
    </View>
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
  inputCard: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18
  },
  input: {
    flex: 1,
    minHeight: 72,
    fontSize: 17,
    lineHeight: 24,
    color: '#333333'
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

export default MyDetailEditScreen
