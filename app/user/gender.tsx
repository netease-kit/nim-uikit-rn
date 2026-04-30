import { useNavigation } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { UIKitPage } from '@/src/NEUIKit/rn'
import { userStore } from '@/stores'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'

const options = [
  { label: '男', value: 1 },
  { label: '女', value: 2 }
] as const

const GenderScreen = observer(() => {
  const navigation = useNavigation()
  const currentGender = userStore.selfProfile?.gender ?? 1
  const [selectedValue, setSelectedValue] = useState(currentGender)
  const isLeavingRef = useRef(false)

  const handleBack = useCallback(
    async (action: Parameters<typeof navigation.dispatch>[0]) => {
      if (isLeavingRef.current) {
        navigation.dispatch(action)
        return
      }

      isLeavingRef.current = true

      if (selectedValue === currentGender) {
        navigation.dispatch(action)
        return
      }

      try {
        await ensureNetworkAvailable()
        await userStore.updateSelfProfile({ gender: selectedValue })
        navigation.dispatch(action)
      } catch (error) {
        navigation.dispatch(action)
        const message = error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
        setTimeout(() => {
          Alert.alert('保存失败', message)
        }, 0)
      }
    },
    [currentGender, navigation, selectedValue]
  )

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (isLeavingRef.current) {
        return
      }

      event.preventDefault()
      void handleBack(event.data.action)
    })

    return unsubscribe
  }, [handleBack, navigation])

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: '性别', headerTitleAlign: 'center' }} />

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
    padding: 16
  },
  card: {
    marginTop: 8,
    borderRadius: 24,
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
