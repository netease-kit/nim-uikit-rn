import * as ImagePicker from 'expo-image-picker'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { UIKitPage, UIKitTextInput, UIKitUserAvatar } from '@/src/NEUIKit/rn'
import { nimStore, teamStore } from '@/stores'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'
import { ensureMediaLibraryPermission } from '@/utils/permissions'

const fieldConfig = {
  name: { placeholder: '请输入群名称', maxLength: 30 },
  intro: { placeholder: '请输入群介绍', maxLength: 100 },
  teamNick: { placeholder: '请输入我的群昵称', maxLength: 30 }
} as const

const TeamEditScreen = observer(() => {
  const { teamId, field, title } = useLocalSearchParams<{
    teamId?: string
    field?: 'name' | 'intro' | 'teamNick' | 'avatar'
    title?: string
  }>()
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const resolvedField = typeof field === 'string' ? field : 'name'
  const resolvedTitle = typeof title === 'string' ? title : '编辑'
  const team = teamStore.getTeam(resolvedTeamId)
  const currentAccountId = nimStore.getLoginUser()
  const member = teamStore
    .getMembers(resolvedTeamId)
    .find((item) => item.accountId === currentAccountId)

  const initialValue = useMemo(() => {
    if (resolvedField === 'name') {
      return team?.name || ''
    }
    if (resolvedField === 'intro') {
      return team?.intro || ''
    }
    if (resolvedField === 'teamNick') {
      return member?.teamNick || ''
    }
    return ''
  }, [member?.teamNick, resolvedField, team?.intro, team?.name])
  const [value, setValue] = useState(initialValue)

  const handleSave = async () => {
    try {
      if (resolvedField === 'name') {
        await teamStore.updateTeamInfo(resolvedTeamId, { name: value.trim() || '群聊' })
      } else if (resolvedField === 'intro') {
        await teamStore.updateTeamInfo(resolvedTeamId, { intro: value.trim() })
      } else if (resolvedField === 'teamNick') {
        await teamStore.updateMyNick(resolvedTeamId, value.trim())
      }

      router.back()
    } catch (error) {
      Alert.alert('保存失败', error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE)
    }
  }

  const handlePickAvatar = async () => {
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
      await teamStore.updateTeamAvatar(resolvedTeamId, result.assets[0].uri)
      router.back()
    } catch (error) {
      Alert.alert('保存失败', error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE)
    }
  }

  if (resolvedField === 'avatar') {
    return (
      <UIKitPage style={styles.page}>
        <Stack.Screen options={{ title: resolvedTitle, headerTitleAlign: 'center' }} />
        <View style={styles.avatarCard}>
          <UIKitUserAvatar
            account={resolvedTeamId || team?.name || '群聊'}
            avatar={team?.avatar}
            size={108}
          />
          <ThemedText style={styles.avatarHint}>从系统相册中选择新的群头像</ThemedText>
          <Pressable style={styles.primaryButton} onPress={handlePickAvatar}>
            <ThemedText style={styles.primaryButtonText}>从相册选择</ThemedText>
          </Pressable>
        </View>
      </UIKitPage>
    )
  }

  const config = fieldConfig[resolvedField as keyof typeof fieldConfig]

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
          placeholder={config?.placeholder}
          maxLength={config?.maxLength}
          multiline={resolvedField === 'intro'}
          style={[styles.input, resolvedField === 'intro' && styles.inputTall]}
        />
        {value ? (
          <Pressable style={styles.clearButton} onPress={() => setValue('')}>
            <ThemedText style={styles.clearText}>×</ThemedText>
          </Pressable>
        ) : null}
      </View>

      <ThemedText style={styles.counterText}>
        {value.length}/{config?.maxLength || 0}
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
  avatarCard: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center'
  },
  avatarHint: {
    marginTop: 16,
    color: '#98A1AD',
    fontSize: 14,
    lineHeight: 20
  },
  primaryButton: {
    marginTop: 22,
    minWidth: 180,
    minHeight: 48,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600'
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
    fontSize: 17,
    lineHeight: 24,
    paddingHorizontal: 20,
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

export default TeamEditScreen
