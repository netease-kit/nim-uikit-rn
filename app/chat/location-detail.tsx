import { Image } from 'expo-image'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitChatEmptyState } from '@/src/NEUIKit/rn'
import { messageStore } from '@/stores'
import { getAmapStaticMapUrl, isValidMapCoordinate, resolveLocationText } from '@/utils/amap'
import { V2NIMMessageLocationAttachment } from '@/utils/nim-sdk'

function encodeUrlText(text: string) {
  return encodeURIComponent(text).replace(/%20/g, '+')
}

async function openFirstAvailable(urls: string[]) {
  for (const url of urls) {
    try {
      const canOpen = await Linking.canOpenURL(url)

      if (!canOpen) {
        continue
      }

      await Linking.openURL(url)
      return true
    } catch {
      continue
    }
  }

  return false
}

const LocationDetailScreen = observer(() => {
  const { t } = useAppTranslation()
  const insets = useSafeAreaInsets()
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
  const locationText = resolveLocationText(message?.text, attachment?.address)
  const hasCoordinate = isValidMapCoordinate(attachment?.latitude, attachment?.longitude)
  const mapImageUrl = getAmapStaticMapUrl(attachment?.latitude, attachment?.longitude, '750*1000')

  const openNavigation = async () => {
    if (!attachment || !hasCoordinate) {
      toast.alert(
        t('locationDetailNavigationUnavailable' as never),
        t('locationDetailCoordinateUnavailable' as never)
      )
      return
    }

    const title = locationText.title || attachment.address || t('commonLocationTitle' as never)
    const encodedTitle = encodeUrlText(title)
    const latitudeValue = attachment.latitude
    const longitudeValue = attachment.longitude
    const backScheme = 'neteaseyunxinimdemo'
    const amapUrl =
      Platform.OS === 'ios'
        ? `iosamap://viewMap?sourceApplication=yunxin_im&backScheme=${backScheme}&poiname=${encodedTitle}&lat=${latitudeValue}&lon=${longitudeValue}&dev=1`
        : `androidamap://viewMap?sourceApplication=NIMUIKit&poiname=${encodedTitle}&lat=${latitudeValue}&lon=${longitudeValue}&dev=0`
    const tencentUrl = `qqmap://map/marker?marker=coord:${latitudeValue},${longitudeValue};title:${encodedTitle}`
    const amapWebUrl = `https://uri.amap.com/marker?position=${longitudeValue},${latitudeValue}&name=${encodedTitle}&src=NIMUIKit&coordinate=gaode&callnative=1`
    const appleMapsUrl =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${latitudeValue},${longitudeValue}&q=${encodedTitle}`
        : ''
    const candidateUrls = [amapUrl, tencentUrl, appleMapsUrl, amapWebUrl].filter(Boolean)

    const opened = await openFirstAvailable(candidateUrls)

    if (!opened) {
      toast.alert(
        t('locationDetailOpenFailed' as never),
        t('locationDetailMapUnavailable' as never)
      )
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {!attachment ? (
        <UIKitChatEmptyState
          title={t('locationDetailUnavailableTitle' as never)}
          description={t('locationDetailUnavailableDescription' as never)}
        />
      ) : (
        <>
          <View style={styles.mapContainer}>
            {mapImageUrl ? (
              <Image source={{ uri: mapImageUrl }} style={styles.mapImage} contentFit="cover" />
            ) : (
              <View style={styles.mapPlaceholder} />
            )}
            <View style={styles.mapOverlayLineHorizontal} />
            <View style={styles.mapOverlayLineVertical} />
            <View style={styles.centerMarker}>
              <View style={styles.centerMarkerDot} />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('locationDetailBack' as never)}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>‹</ThemedText>
          </Pressable>

          <View style={[styles.bottomGuide, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.bottomText}>
              <ThemedText numberOfLines={1} style={styles.locationTitle}>
                {locationText.title}
              </ThemedText>
              <ThemedText numberOfLines={1} style={styles.locationSubtitle}>
                {locationText.subtitle}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('locationDetailNavigate' as never)}
              style={styles.navigationButton}
              onPress={() => {
                openNavigation().catch((error) => {
                  toast.alert(
                    t('locationDetailOpenFailed' as never),
                    error instanceof Error
                      ? error.message
                      : t('locationDetailMapOpenUnavailable' as never)
                  )
                })
              }}
            >
              <View style={styles.navigationArrow} />
            </Pressable>
          </View>
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
  mapContainer: {
    flex: 1,
    backgroundColor: '#EAF0F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EAF0F6'
  },
  mapOverlayLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120, 133, 150, 0.22)'
  },
  mapOverlayLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120, 133, 150, 0.22)'
  },
  centerMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#337EFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  centerMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF'
  },
  backButton: {
    position: 'absolute',
    left: 28,
    top: 54,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 30,
    marginTop: -2
  },
  bottomGuide: {
    minHeight: 111,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 16
  },
  bottomText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
    gap: 6
  },
  locationTitle: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 22
  },
  locationSubtitle: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 20
  },
  navigationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navigationArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }, { translateY: 1 }]
  }
})

export default LocationDetailScreen
