import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { UIKitTextInput } from '@/src/NEUIKit/rn'
import { friendStore } from '@/stores'

const FriendEditScreen = observer(() => {
  const insets = useSafeAreaInsets()
  const { accountId } = useLocalSearchParams<{ accountId?: string }>()
  const resolvedAccountId = typeof accountId === 'string' ? accountId : ''
  const friend = friendStore.friends.get(resolvedAccountId)
  const initialAlias = useMemo(() => friend?.alias || '', [friend?.alias])
  const [alias, setAlias] = useState(initialAlias)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.cancelText}>取消</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.titleText}>备注名</ThemedText>
        <TouchableOpacity
          onPress={async () => {
            try {
              await friendStore.updateAlias(resolvedAccountId, alias.trim())
              router.back()
            } catch (error) {
              Alert.alert('保存失败', error instanceof Error ? error.message : '请稍后重试')
            }
          }}
        >
          <ThemedText style={styles.saveText}>保存</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputCard}>
        <UIKitTextInput
          placeholder="请输入备注名"
          value={alias}
          maxLength={15}
          onChangeText={setAlias}
          style={styles.input}
        />
        {!!alias ? (
          <TouchableOpacity style={styles.clearChip} onPress={() => setAlias('')}>
            <ThemedText style={styles.clearChipText}>x</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F7'
  },
  topBar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  cancelText: {
    color: '#6E7580',
    fontSize: 17,
    lineHeight: 24
  },
  titleText: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700'
  },
  saveText: {
    color: '#337EFF',
    fontSize: 17,
    lineHeight: 24
  },
  inputCard: {
    minHeight: 72,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18
  },
  input: {
    flex: 1,
    height: 72,
    color: '#333333',
    fontSize: 17,
    lineHeight: 24,
    paddingVertical: 0
  },
  clearChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#B7BDC7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700'
  }
})

export default FriendEditScreen
