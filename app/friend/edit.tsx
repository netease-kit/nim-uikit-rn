import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitTextInput } from '@/src/NEUIKit/rn'
import { friendStore } from '@/stores'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'

const FriendEditScreen = observer(() => {
  const { t } = useAppTranslation()
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
          <ThemedText style={styles.cancelText}>{t('actionCancel')}</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.titleText}>{t('friendRemarkTitle')}</ThemedText>
        <TouchableOpacity
          onPress={async () => {
            try {
              await ensureNetworkAvailable()
              await friendStore.updateAlias(resolvedAccountId, alias.trim())
              router.back()
            } catch (error) {
              toast.alert(
                t('saveFailed'),
                error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
              )
            }
          }}
        >
          <ThemedText style={styles.saveText}>{t('actionSave')}</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputCard}>
        <UIKitTextInput
          placeholder={t('friendEditPlaceholder')}
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
