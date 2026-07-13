import { Image } from 'expo-image'
import { router, Stack } from 'expo-router'
import { version as sdkVersion } from 'nim-web-sdk-ng/package.json'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { UIKitPage } from '@/src/NEUIKit/rn'

import { version as uiKitVersion } from '../../package.json'

const AboutNeteaseScreen = () => {
  const { t } = useAppTranslation()
  const { runWithNavigationLock } = useNavigationLock()

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: t('aboutTitle'), headerTitleAlign: 'center' }} />

      <View style={styles.hero}>
        <Image
          source="https://yx-web-nosdn.netease.im/common/fcd2d5e8d2897d4b2d965e06509f47d2/about-logo.png"
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText style={styles.heroTitle}>{t('aboutBrand')}</ThemedText>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>{t('aboutVersion')}</ThemedText>
          <ThemedText style={styles.rowValue}>{uiKitVersion}</ThemedText>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>{t('aboutImVersion')}</ThemedText>
          <ThemedText style={styles.rowValue}>{sdkVersion}</ThemedText>
        </View>
        <View style={styles.divider} />
        <Pressable
          style={styles.row}
          onPress={() =>
            runWithNavigationLock(() => {
              router.push('/user/product-intro' as never)
            })
          }
        >
          <ThemedText style={styles.rowLabel}>{t('aboutProductInfo')}</ThemedText>
          <ThemedText style={styles.chevron}>›</ThemedText>
        </Pressable>
      </View>
    </UIKitPage>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: 22
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 22
  },
  logo: {
    width: 72,
    height: 72
  },
  heroTitle: {
    marginTop: 10,
    color: '#000000',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#FFFFFF'
  },
  row: {
    minHeight: 48,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowLabel: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 20
  },
  rowValue: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 20
  },
  divider: {
    height: 1,
    marginLeft: 20,
    backgroundColor: '#F5F8FC'
  },
  chevron: {
    color: '#A6AFBB',
    fontSize: 16,
    lineHeight: 16
  }
})

export default AboutNeteaseScreen
