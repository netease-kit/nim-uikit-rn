import { Image } from 'expo-image'
import { Stack } from 'expo-router'
import React from 'react'
import { Linking, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { UIKitPage } from '@/src/NEUIKit/rn'

const UIKIT_VERSION = '10.0.0-beta'
const IM_SDK_VERSION = '10.9.0'
const YUNXIN_WEBSITE = 'https://yunxin.163.com/'

const AboutNeteaseScreen = () => {
  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: '关于云信', headerTitleAlign: 'center' }} />

      <View style={styles.hero}>
        <Image
          source="https://yx-web-nosdn.netease.im/common/fcd2d5e8d2897d4b2d965e06509f47d2/about-logo.png"
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText style={styles.heroTitle}>云信IM H5</ThemedText>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>版本号</ThemedText>
          <ThemedText style={styles.rowValue}>{UIKIT_VERSION}</ThemedText>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>IM版本号</ThemedText>
          <ThemedText style={styles.rowValue}>{IM_SDK_VERSION}</ThemedText>
        </View>
        <View style={styles.divider} />
        <Pressable
          style={styles.row}
          onPress={() => {
            Linking.openURL(YUNXIN_WEBSITE).catch(() => undefined)
          }}
        >
          <ThemedText style={styles.rowLabel}>产品介绍</ThemedText>
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
