import * as Location from 'expo-location'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitChatEmptyState } from '@/src/NEUIKit/rn'
import { messageStore } from '@/stores'
import { translateCurrentApp } from '@/utils/app-language'

type LocationPoi = {
  id: string
  title: string
  address: string
  latitude: number
  longitude: number
  distance?: number
  selected?: boolean
}

type PickerMessage =
  | {
      type: 'ready'
    }
  | {
      type: 'select'
      latitude: number
      longitude: number
    }

type MapCommand =
  | {
      type: 'move'
      latitude: number
      longitude: number
    }
  | {
      type: 'setSelected'
      latitude: number
      longitude: number
    }

const DEFAULT_LOCATION = {
  latitude: 39.908722,
  longitude: 116.397499
}

const SEARCH_DEBOUNCE_MS = 500
const LOCATION_POI_ROW_HEIGHT = 64
const LOCATION_POI_INITIAL_RENDER_COUNT = 10
const LOCATION_POI_BATCH_RENDER_COUNT = 8
const LOCATION_POI_WINDOW_SIZE = 8

function formatCoordinateAddress(latitude: number, longitude: number) {
  return translateCurrentApp('locationPickerCoordinateAddress' as never, {
    latitude: latitude.toFixed(6),
    longitude: longitude.toFixed(6)
  })
}

function formatDistance(distance?: number) {
  if (!distance || distance <= 0) {
    return ''
  }

  if (distance < 1000) {
    return `${Math.ceil(distance)}m`
  }

  return `${(distance / 1000).toFixed(1)}km`
}

function showSendFailureAlert(error: unknown, fallbackMessage: string) {
  return
}

function getDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) {
  const earthRadius = 6371000
  const toRadians = (value: number) => (value * Math.PI) / 180
  const deltaLatitude = toRadians(latitudeB - latitudeA)
  const deltaLongitude = toRadians(longitudeB - longitudeA)
  const startLatitude = toRadians(latitudeA)
  const endLatitude = toRadians(latitudeB)
  const haversine =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2)

  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function createPoiId(latitude: number, longitude: number, title: string) {
  return `${latitude.toFixed(6)}-${longitude.toFixed(6)}-${title}`
}

function buildCoordinatePoi(latitude: number, longitude: number): LocationPoi {
  const title = formatCoordinateAddress(latitude, longitude)

  return {
    id: createPoiId(latitude, longitude, title),
    title,
    address: title,
    latitude,
    longitude
  }
}

function buildAddressParts(address: Location.LocationGeocodedAddress) {
  return [
    address.region,
    address.city,
    address.district,
    address.street,
    address.streetNumber,
    address.name
  ].filter(Boolean) as string[]
}

function buildMapHtml(initialLocation: { latitude: number; longitude: number }) {
  const latitude = Number.isFinite(initialLocation.latitude)
    ? initialLocation.latitude
    : DEFAULT_LOCATION.latitude
  const longitude = Number.isFinite(initialLocation.longitude)
    ? initialLocation.longitude
    : DEFAULT_LOCATION.longitude

  const loadingText = translateCurrentApp('locationPickerMapLoading' as never)

  return `
    <!doctype html>
    <html lang="${getMapHtmlLanguage()}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body, #map {
            margin: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #eef2f7;
          }
          .leaflet-control-attribution {
            font-size: 10px;
          }
          .map-fallback {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            font: 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            text-align: center;
            padding: 24px;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div id="fallback" class="map-fallback">${loadingText}</div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const initial = { latitude: ${latitude}, longitude: ${longitude} };
          const post = (payload) => {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          };
          let map;
          let marker;

          function moveMap(latitude, longitude, shouldNotify) {
            if (!map || !marker) {
              return;
            }

            const latlng = { lat: latitude, lng: longitude };
            marker.setLatLng(latlng);
            map.panTo(latlng);
            if (shouldNotify) {
              post({ type: 'select', latitude, longitude });
            }
          }

          function handleCommand(payload) {
            if (!payload || typeof payload !== 'object') {
              return;
            }

            if (payload.type === 'move' || payload.type === 'setSelected') {
              moveMap(payload.latitude, payload.longitude, false);
            }
          }

          function initMap() {
            if (!window.L) {
              return;
            }

            document.getElementById('fallback').style.display = 'none';
            map = L.map('map', { zoomControl: true }).setView([initial.latitude, initial.longitude], 16);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap'
            }).addTo(map);
            marker = L.marker([initial.latitude, initial.longitude], { draggable: true }).addTo(map);

            map.on('moveend', () => {
              const center = map.getCenter();
              post({ type: 'select', latitude: center.lat, longitude: center.lng });
            });
            map.on('click', (event) => moveMap(event.latlng.lat, event.latlng.lng, true));
            marker.on('dragend', () => {
              const latlng = marker.getLatLng();
              moveMap(latlng.lat, latlng.lng, true);
            });
            post({ type: 'ready' });
          }

          document.addEventListener('message', (event) => {
            try {
              handleCommand(JSON.parse(event.data));
            } catch (error) {}
          });
          window.addEventListener('message', (event) => {
            try {
              handleCommand(JSON.parse(event.data));
            } catch (error) {}
          });

          setTimeout(initMap, 0);
        </script>
      </body>
    </html>
  `
}

function getMapHtmlLanguage() {
  return translateCurrentApp('languageOptionEnglish' as never) === 'English' ? 'en' : 'zh-CN'
}

const LocationPickerScreen = () => {
  const { t } = useAppTranslation()
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION)
  const [mapCenter, setMapCenter] = useState(DEFAULT_LOCATION)
  const [pois, setPois] = useState<LocationPoi[]>([])
  const [selectedPoi, setSelectedPoi] = useState<LocationPoi | null>(null)
  const [searchText, setSearchText] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [loadingPois, setLoadingPois] = useState(false)
  const [sending, setSending] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)
  const webViewRef = useRef<WebView>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const insets = useSafeAreaInsets()

  const mapHtml = useMemo(() => buildMapHtml(DEFAULT_LOCATION), [])

  const postMapCommand = useCallback((command: MapCommand) => {
    webViewRef.current?.postMessage(JSON.stringify(command))
  }, [])

  const selectPoi = useCallback(
    (poi: LocationPoi, shouldMoveMap = true) => {
      const nextPoi = { ...poi, selected: true }
      setSelectedPoi(nextPoi)
      setPois((items) => items.map((item) => ({ ...item, selected: item.id === poi.id })))
      setMapCenter({ latitude: poi.latitude, longitude: poi.longitude })

      if (shouldMoveMap) {
        postMapCommand({
          type: 'setSelected',
          latitude: poi.latitude,
          longitude: poi.longitude
        })
      }
    },
    [postMapCommand]
  )

  const loadPoisForCoordinates = useCallback(
    async (latitude: number, longitude: number, options?: { autoSelect?: boolean }) => {
      setLoadingPois(true)
      try {
        const addresses = await Location.reverseGeocodeAsync({ latitude, longitude })
        const reversePois =
          addresses.length > 0
            ? addresses.map((address, index) => {
                const parts = buildAddressParts(address)
                const title = address.name || address.street || parts[parts.length - 1]
                const fullAddress = parts.join('')
                const resolvedTitle = title || formatCoordinateAddress(latitude, longitude)
                const resolvedAddress = fullAddress || formatCoordinateAddress(latitude, longitude)

                return {
                  id: createPoiId(latitude, longitude, `${resolvedTitle}-${index}`),
                  title: resolvedTitle,
                  address: resolvedAddress,
                  latitude,
                  longitude,
                  distance: getDistanceMeters(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    latitude,
                    longitude
                  )
                }
              })
            : []
        const nextPois =
          reversePois.length > 0 ? reversePois : [buildCoordinatePoi(latitude, longitude)]

        setPois(nextPois)
        if (options?.autoSelect !== false && nextPois[0]) {
          selectPoi(nextPois[0], false)
        }
      } catch {
        const fallbackPoi = buildCoordinatePoi(latitude, longitude)
        setPois([fallbackPoi])
        if (options?.autoSelect !== false) {
          selectPoi(fallbackPoi, false)
        }
      } finally {
        setLoadingPois(false)
      }
    },
    [currentLocation.latitude, currentLocation.longitude, selectPoi]
  )

  const searchPois = useCallback(
    async (keyword: string) => {
      const trimmedKeyword = keyword.trim()
      if (!trimmedKeyword) {
        await loadPoisForCoordinates(mapCenter.latitude, mapCenter.longitude)
        return
      }

      setLoadingPois(true)
      try {
        const results = await Location.geocodeAsync(trimmedKeyword)
        const nextPois = results.slice(0, 20).map((result, index) => {
          const title = index === 0 ? trimmedKeyword : `${trimmedKeyword} ${index + 1}`
          return {
            id: createPoiId(result.latitude, result.longitude, `${title}-${index}`),
            title,
            address: formatCoordinateAddress(result.latitude, result.longitude),
            latitude: result.latitude,
            longitude: result.longitude,
            distance: getDistanceMeters(
              currentLocation.latitude,
              currentLocation.longitude,
              result.latitude,
              result.longitude
            )
          }
        })

        if (nextPois.length > 0) {
          setPois(nextPois)
          selectPoi(nextPois[0])
        } else {
          setPois([])
          setSelectedPoi(null)
        }
      } catch {
        setPois([])
        setSelectedPoi(null)
      } finally {
        setLoadingPois(false)
      }
    },
    [
      currentLocation.latitude,
      currentLocation.longitude,
      loadPoisForCoordinates,
      mapCenter.latitude,
      mapCenter.longitude,
      selectPoi
    ]
  )

  const initializeLocation = useCallback(async () => {
    try {
      setLoadingLocation(true)
      const permission = await Location.requestForegroundPermissionsAsync()

      if (!permission.granted) {
        setLocationPermissionDenied(true)
        await loadPoisForCoordinates(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude)
        return
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync()

      if (!servicesEnabled) {
        setLocationPermissionDenied(true)
        await loadPoisForCoordinates(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude)
        return
      }

      const location =
        (await Location.getLastKnownPositionAsync({
          maxAge: 60 * 1000,
          requiredAccuracy: 200
        })) ||
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        }))
      const nextLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }

      setLocationPermissionDenied(false)
      setCurrentLocation(nextLocation)
      setMapCenter(nextLocation)
      postMapCommand({
        type: 'move',
        latitude: nextLocation.latitude,
        longitude: nextLocation.longitude
      })
      await loadPoisForCoordinates(nextLocation.latitude, nextLocation.longitude)
    } catch (error) {
      await loadPoisForCoordinates(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude)
      toast.alert(
        t('locationPickerLocationFailedTitle'),
        error instanceof Error ? error.message : t('locationPickerLocationFailedMessage')
      )
    } finally {
      setLoadingLocation(false)
    }
  }, [loadPoisForCoordinates, postMapCommand, t])

  useEffect(() => {
    initializeLocation().catch(() => undefined)
  }, [initializeLocation])

  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    searchTimerRef.current = setTimeout(() => {
      searchPois(searchText).catch(() => undefined)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [searchPois, searchText])

  const handleMapMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as PickerMessage

      if (payload.type === 'ready') {
        setMapReady(true)
        postMapCommand({
          type: 'move',
          latitude: mapCenter.latitude,
          longitude: mapCenter.longitude
        })
        return
      }

      if (payload.type === 'select') {
        setMapCenter({
          latitude: payload.latitude,
          longitude: payload.longitude
        })

        if (!searchText.trim()) {
          loadPoisForCoordinates(payload.latitude, payload.longitude).catch(() => undefined)
        }
      }
    } catch {
      // Ignore malformed messages from the embedded map.
    }
  }

  const handleSearchCancel = () => {
    setSearchText('')
    setSearchFocused(false)
    Keyboard.dismiss()
    loadPoisForCoordinates(currentLocation.latitude, currentLocation.longitude).catch(
      () => undefined
    )
    postMapCommand({
      type: 'move',
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    })
  }

  const handleLocateCurrent = () => {
    initializeLocation().catch(() => undefined)
  }

  const handleSendLocation = async () => {
    const poi = selectedPoi || pois[0]

    if (!poi) {
      toast.alert(
        t('locationPickerSendUnavailableTitle'),
        t('locationPickerSendUnavailableMessage')
      )
      return
    }

    try {
      setSending(true)
      await messageStore.sendLocationMessage(
        resolvedConversationId,
        poi.latitude,
        poi.longitude,
        [poi.title, poi.address].filter(Boolean).join(' '),
        poi.title
      )
      router.back()
    } catch (error) {
      showSendFailureAlert(error, t('chatSendMediaFailed'))
    } finally {
      setSending(false)
    }
  }

  const renderPoi = ({ item }: { item: LocationPoi }) => {
    const distance = formatDistance(item.distance)

    return (
      <TouchableOpacity style={styles.poiRow} onPress={() => selectPoi(item)}>
        <View style={styles.poiTextWrap}>
          <ThemedText numberOfLines={1} style={styles.poiTitle}>
            {item.title}
          </ThemedText>
          <ThemedText numberOfLines={1} style={styles.poiAddress}>
            {[distance, item.address].filter(Boolean).join(' | ')}
          </ThemedText>
        </View>
        {item.selected || selectedPoi?.id === item.id ? (
          <View style={styles.selectedDot}>
            <ThemedText style={styles.selectedMark}>✓</ThemedText>
          </View>
        ) : null}
      </TouchableOpacity>
    )
  }

  if (!resolvedConversationId) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: t('locationPickerTitle'),
            headerTitleAlign: 'center',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#FFFFFF' }
          }}
        />
        <UIKitChatEmptyState
          title={t('locationPickerConversationUnavailableTitle')}
          description={t('locationPickerConversationUnavailableDescription')}
        />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.mapWrap}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.mapWebView}
            onMessage={handleMapMessage}
            javaScriptEnabled
            domStorageEnabled
          />

          <View style={[styles.topBar, { paddingTop: insets.top + 14 }]}>
            <TouchableOpacity style={styles.headerTextButton} onPress={() => router.back()}>
              <ThemedText style={styles.cancelText}>{t('actionCancel')}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, (!selectedPoi || sending) && styles.sendButtonDisabled]}
              onPress={handleSendLocation}
              disabled={!selectedPoi || sending}
            >
              {sending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={styles.sendText}>{t('sendText' as never)}</ThemedText>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.locateButton}
            onPress={handleLocateCurrent}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator color="#337EFF" size="small" />
            ) : (
              <ThemedText style={styles.locateIcon}>⌖</ThemedText>
            )}
          </TouchableOpacity>

          {loadingLocation || !mapReady ? (
            <View style={styles.mapLoadingOverlay} pointerEvents="none">
              <ActivityIndicator color="#337EFF" />
              <ThemedText style={styles.mapLoadingText}>
                {loadingLocation ? t('locationPickerLocating') : t('locationPickerLoadingMap')}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <View style={styles.searchBar}>
            <ThemedText style={styles.searchIcon}>⌕</ThemedText>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setSearchFocused(true)}
              placeholder={t('locationPickerSearchPlaceholder')}
              placeholderTextColor="#8E97A5"
              returnKeyType="search"
              onSubmitEditing={() => searchPois(searchText).catch(() => undefined)}
            />
            {searchFocused || searchText.length > 0 ? (
              <TouchableOpacity style={styles.searchCancelButton} onPress={handleSearchCancel}>
                <ThemedText style={styles.searchCancelText}>{t('actionCancel')}</ThemedText>
              </TouchableOpacity>
            ) : null}
          </View>

          {locationPermissionDenied ? (
            <View style={styles.permissionTip}>
              <ThemedText style={styles.permissionTipText}>
                {t('locationPickerPermissionTip')}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.poiListWrap}>
            {loadingPois ? (
              <View style={styles.listState}>
                <ActivityIndicator color="#337EFF" />
                <ThemedText style={styles.listStateText}>{t('locationPickerSearching')}</ThemedText>
              </View>
            ) : pois.length > 0 ? (
              <FlatList
                data={pois}
                renderItem={renderPoi}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                style={styles.poiList}
                removeClippedSubviews
                initialNumToRender={LOCATION_POI_INITIAL_RENDER_COUNT}
                maxToRenderPerBatch={LOCATION_POI_BATCH_RENDER_COUNT}
                windowSize={LOCATION_POI_WINDOW_SIZE}
                updateCellsBatchingPeriod={16}
                getItemLayout={(_, index) => ({
                  length: LOCATION_POI_ROW_HEIGHT,
                  offset: LOCATION_POI_ROW_HEIGHT * index,
                  index
                })}
              />
            ) : (
              <View style={styles.listState}>
                <ThemedText style={styles.emptyIcon}>⌕</ThemedText>
                <ThemedText style={styles.listStateText}>{t('locationPickerEmpty')}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  keyboardAvoidingView: {
    flex: 1
  },
  mapWrap: {
    flex: 1,
    minHeight: 320,
    backgroundColor: '#EEF2F7'
  },
  mapWebView: {
    flex: 1,
    backgroundColor: '#EEF2F7'
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 108,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(17, 24, 39, 0.24)'
  },
  headerTextButton: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  sendButton: {
    minWidth: 64,
    minHeight: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#337EFF'
  },
  sendButtonDisabled: {
    opacity: 0.58
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  locateButton: {
    position: 'absolute',
    right: 12,
    bottom: 30,
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#111827',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3
  },
  locateIcon: {
    color: '#337EFF',
    fontSize: 22,
    fontWeight: '700'
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)'
  },
  mapLoadingText: {
    marginTop: 10,
    color: '#697386',
    fontSize: 14
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6EBF2'
  },
  searchBar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10
  },
  searchIcon: {
    width: 20,
    color: '#8E97A5',
    fontSize: 18,
    textAlign: 'center'
  },
  searchInput: {
    flex: 1,
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: '#F2F4F7',
    paddingHorizontal: 14,
    color: '#222222',
    fontSize: 14
  },
  searchCancelButton: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  searchCancelText: {
    color: '#666666',
    fontSize: 14
  },
  permissionTip: {
    marginHorizontal: 12,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  permissionTipText: {
    color: '#A36500',
    fontSize: 12
  },
  poiListWrap: {
    height: 212,
    backgroundColor: '#FFFFFF'
  },
  poiList: {
    flex: 1
  },
  poiRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF1F5'
  },
  poiTextWrap: {
    flex: 1,
    paddingRight: 10
  },
  poiTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600'
  },
  poiAddress: {
    marginTop: 5,
    color: '#999999',
    fontSize: 13
  },
  selectedDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#337EFF'
  },
  selectedMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  listState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listStateText: {
    marginTop: 8,
    color: '#B3B7BC',
    fontSize: 14
  },
  emptyIcon: {
    color: '#C1C7D0',
    fontSize: 24
  }
})

export default LocationPickerScreen
