import { Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { preferenceStore } from '@/stores'

const options = [
  { value: 'basic', label: '基础皮肤', description: '默认的基础样式' },
  { value: 'common', label: '通用皮肤', description: '切换到通用风格展示' }
] as const

const AppearanceScreen = observer(() => {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '选择外观', headerTitleAlign: 'center' }} />

      {options.map((option) => {
        const isSelected = preferenceStore.preferences.appearance === option.value

        return (
          <Pressable
            key={option.value}
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={async () => {
              try {
                await preferenceStore.updatePreference('appearance', option.value)
              } catch (error) {
                Alert.alert('切换失败', error instanceof Error ? error.message : '请稍后重试')
              }
            }}
          >
            <View style={styles.optionText}>
              <ThemedText type="defaultSemiBold">{option.label}</ThemedText>
              <ThemedText style={styles.optionDescription}>{option.description}</ThemedText>
            </View>
            <View style={[styles.indicator, isSelected && styles.indicatorSelected]}>
              {isSelected ? <View style={styles.indicatorDot} /> : null}
            </View>
          </Pressable>
        )
      })}
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12
  },
  optionCard: {
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  optionCardSelected: {
    borderColor: '#337EFF',
    backgroundColor: '#F0F6FF'
  },
  optionText: {
    flex: 1
  },
  optionDescription: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280'
  },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  indicatorSelected: {
    borderColor: '#337EFF'
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#337EFF'
  }
})

export default AppearanceScreen
