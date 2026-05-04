import NetInfo from '@react-native-community/netinfo'

export const NETWORK_UNAVAILABLE_MESSAGE = '当前网络不可用，请检查你的网络设置'

export async function isNetworkAvailable() {
  const state = await NetInfo.fetch()
  return !!state.isConnected && state.isInternetReachable !== false
}

export async function ensureNetworkAvailable() {
  const available = await isNetworkAvailable()

  if (!available) {
    throw new Error(NETWORK_UNAVAILABLE_MESSAGE)
  }
}
