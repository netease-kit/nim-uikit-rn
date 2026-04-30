import { Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Alert, Linking, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import {
  UIKitActionPill,
  UIKitChatComposerShell,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle
} from '@/src/NEUIKit/rn'
import { conversationStore, messageStore } from '@/stores'
import { V2NIMMessageLocationAttachment } from '@/utils/nim-sdk'

function formatTimestamp(timestamp?: number) {
  if (!timestamp) {
    return ''
  }

  return new Date(timestamp).toLocaleString()
}

const LocationDetailScreen = observer(() => {
  const { conversationId, messageId, address, latitude, longitude } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
    address?: string
    latitude?: string
    longitude?: string
  }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const resolvedMessageId = typeof messageId === 'string' ? messageId : ''
  const message = messageStore.getMessageById(resolvedConversationId, resolvedMessageId)
  const conversation = conversationStore.getConversation(resolvedConversationId)
  const resolvedAddress = typeof address === 'string' ? address : ''
  const resolvedLatitude = typeof latitude === 'string' ? Number(latitude) : undefined
  const resolvedLongitude = typeof longitude === 'string' ? Number(longitude) : undefined
  const attachment =
    (message?.attachment as V2NIMMessageLocationAttachment | undefined) ||
    (resolvedAddress || resolvedLatitude !== undefined || resolvedLongitude !== undefined
      ? {
          address: resolvedAddress,
          latitude: resolvedLatitude || 0,
          longitude: resolvedLongitude || 0
        }
      : undefined)
  const placeholder = conversation?.name ? `发送给 ${conversation.name}` : '发送给 当前会话'

  const openMap = async () => {
    if (!attachment) {
      return
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${attachment.latitude},${attachment.longitude}`
    const canOpen = await Linking.canOpenURL(url)

    if (!canOpen) {
      Alert.alert('打开失败', '当前设备无法打开地图')
      return
    }

    await Linking.openURL(url)
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title="位置详情" />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

      {!attachment ? (
        <UIKitChatEmptyState
          title="位置消息不存在"
          description="当前地理位置还没有同步完成，稍后再试。"
        />
      ) : (
        <>
          <View style={styles.content}>
            {message?.createTime ? (
              <ThemedText style={styles.timestamp}>
                {formatTimestamp(message.createTime)}
              </ThemedText>
            ) : null}

            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <ThemedText numberOfLines={1} style={styles.locationTitle}>
                  {attachment.address || '暂无详细地址'}
                </ThemedText>
                <ThemedText style={styles.locationSubtitle}>
                  纬度 {attachment.latitude} · 经度 {attachment.longitude}
                </ThemedText>
              </View>
              <View style={styles.mapPreview}>
                <View style={styles.mapPinOuter}>
                  <View style={styles.mapPinInner} />
                </View>
                <View style={styles.mapLineHorizontal} />
                <View style={styles.mapLineVertical} />
              </View>
              <View style={styles.actionRow}>
                <UIKitActionPill
                  label="打开地图"
                  tone="primary"
                  onPress={() => {
                    openMap().catch((error) => {
                      Alert.alert(
                        '打开失败',
                        error instanceof Error ? error.message : '当前地图无法打开'
                      )
                    })
                  }}
                />
                <UIKitActionPill
                  label="复制地址"
                  onPress={() => {
                    Alert.alert('地址信息', attachment.address || '暂无详细地址')
                  }}
                />
              </View>
            </View>
          </View>

          <UIKitChatComposerShell placeholder={placeholder} />
        </>
      )}
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28
  },
  timestamp: {
    alignSelf: 'center',
    color: '#BCC4D0',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 28
  },
  locationCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF'
  },
  locationHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 6
  },
  locationTitle: {
    color: '#2E3541',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700'
  },
  locationSubtitle: {
    color: '#A3ADB9',
    fontSize: 14,
    lineHeight: 20
  },
  mapPreview: {
    height: 224,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapPinOuter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  mapPinInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF'
  },
  mapLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#D9E2ED'
  },
  mapLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 2,
    backgroundColor: '#D9E2ED'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 16
  }
})

export default LocationDetailScreen
