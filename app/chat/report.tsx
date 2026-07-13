import { Stack } from 'expo-router'
import React, { useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { WebView } from 'react-native-webview'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { UIKitChatEmptyState, UIKitChatHeaderTitle } from '@/src/NEUIKit/rn'

const REPORT_URL = 'https://yunxin.163.com/survey/report'

export default function ChatReportScreen() {
  const { t } = useAppTranslation()
  const webViewRef = useRef<WebView>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title={t('chatReportTitle' as never)} />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

      {loadFailed ? (
        <View style={styles.errorState}>
          <UIKitChatEmptyState
            title={t('chatReportLoadFailed' as never)}
            description={t('chatReportLoadFailedDescription' as never)}
          />
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoadFailed(false)
              webViewRef.current?.reload()
            }}
          >
            <ThemedText style={styles.retryButtonText}>{t('commonReload' as never)}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: REPORT_URL }}
          style={styles.webView}
          setSupportMultipleWindows={false}
          startInLoadingState
          onError={() => {
            setLoadFailed(true)
          }}
          renderLoading={() => (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color="#337EFF" />
            </View>
          )}
        />
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
    backgroundColor: '#FFFFFF'
  },
  retryButton: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#337EFF'
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700'
  }
})
