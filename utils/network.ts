import NetInfo, { type NetInfoState } from '@react-native-community/netinfo'

import { translateCurrentApp } from '@/utils/app-language'

let fallbackNetworkAvailableChecker: (() => boolean) | null = null
let latestKnownNetworkAvailable: boolean | null = null
let networkStateTrackingInitialized = false

function resolveNetworkAvailability(state: NetInfoState) {
  if (state.isConnected === false || state.isInternetReachable === false) {
    return fallbackNetworkAvailableChecker?.() ?? false
  }

  return true
}

function updateKnownNetworkAvailability(state: NetInfoState) {
  const available = resolveNetworkAvailability(state)
  latestKnownNetworkAvailable = available
  return available
}

function ensureNetworkStateTracking() {
  if (networkStateTrackingInitialized) {
    return
  }

  networkStateTrackingInitialized = true

  NetInfo.addEventListener((state) => {
    updateKnownNetworkAvailability(state)
  })

  NetInfo.fetch()
    .then((state) => {
      updateKnownNetworkAvailability(state)
    })
    .catch(() => undefined)
}

export function setFallbackNetworkAvailableChecker(checker: (() => boolean) | null) {
  fallbackNetworkAvailableChecker = checker
}

export function getNetworkUnavailableMessage() {
  return translateCurrentApp('commonNetworkUnavailable')
}

export const NETWORK_UNAVAILABLE_MESSAGE = getNetworkUnavailableMessage()

export function getKnownNetworkAvailability() {
  ensureNetworkStateTracking()
  return latestKnownNetworkAvailable
}

export function isKnownOffline() {
  return getKnownNetworkAvailability() === false
}

export async function isNetworkAvailable() {
  ensureNetworkStateTracking()
  const state = await NetInfo.fetch()
  return updateKnownNetworkAvailability(state)
}

export async function getConfirmedOfflineMessage() {
  return (await isNetworkAvailable()) ? null : getNetworkUnavailableMessage()
}

export async function ensureNetworkAvailable() {
  const available = await isNetworkAvailable()

  if (!available) {
    throw new Error(getNetworkUnavailableMessage())
  }
}

ensureNetworkStateTracking()
