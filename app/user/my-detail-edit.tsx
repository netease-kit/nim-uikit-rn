import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { UIKitPage, UIKitTextInput } from '@/src/NEUIKit/rn'
import { userStore } from '@/stores'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'

type FieldConfig = {
  maxLength: number
  keyboardType: 'default' | 'number-pad' | 'email-address'
  placeholder: string
  multiline?: boolean
}

const fieldConfig: Record<'name' | 'mobile' | 'email' | 'sign', FieldConfig> = {
  name: { maxLength: 15, keyboardType: 'default', placeholder: '请输入昵称' },
  mobile: { maxLength: 11, keyboardType: 'number-pad', placeholder: '请输入手机号' },
  email: { maxLength: 30, keyboardType: 'email-address', placeholder: '请输入邮箱' },
  sign: { maxLength: 50, keyboardType: 'default', placeholder: '请输入个性签名', multiline: true }
}

const MyDetailEditScreen = observer(() => {
  const { field, title } = useLocalSearchParams<{ field?: string; title?: string }>()
  const resolvedField = typeof field === 'string' ? field : 'name'
  const resolvedTitle = typeof title === 'string' ? title : '编辑'
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
      Alert.alert('保存失败', '请输入正确的手机号')
      return
    }

    if (
      resolvedField === 'email' &&
      normalizedValue &&
      (!normalizedValue.includes('@') ||
        (!normalizedValue.includes('.com') && !normalizedValue.includes('.cn')))
    ) {
      Alert.alert('保存失败', '请输入正确的邮箱')
      return
    }

    try {
      await ensureNetworkAvailable()
      await userStore.updateSelfProfile({ [resolvedField]: normalizedValue } as never)
      router.back()
    } catch (error) {
      Alert.alert('保存失败', error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE)
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen
        options={{
          title: resolvedTitle,
          headerTitleAlign: 'center',
          headerRight: () => (
            <Pressable onPress={handleSave}>
              <ThemedText style={styles.headerAction}>完成</ThemedText>
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
          <Pressable style={styles.clearButton} onPress={() => setValue('')}>
            <ThemedText style={styles.clearText}>×</ThemedText>
          </Pressable>
        ) : null}
      </View>

      <ThemedText style={styles.counterText}>
        {value.length}/{config.maxLength}
      </ThemedText>
    </UIKitPage>
  )
})

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16
  },
  headerAction: {
    color: '#337EFF',
    fontWeight: '700'
  },
  inputCard: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 14
  },
  input: {
    flex: 1,
    minHeight: 68,
    paddingHorizontal: 20,
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
