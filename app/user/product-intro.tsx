import { Image } from 'expo-image'
import { Stack } from 'expo-router'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { UIKitPage } from '@/src/NEUIKit/rn'

const ProductIntroScreen = () => {
  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: '产品介绍', headerTitleAlign: 'center' }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image
            source="https://yx-web-nosdn.netease.im/common/fcd2d5e8d2897d4b2d965e06509f47d2/about-logo.png"
            style={styles.logo}
            contentFit="contain"
          />
          <ThemedText style={styles.heroTitle}>网易云信</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            连接全球用户与企业，提供稳定、可靠、可扩展的实时通信能力。
          </ThemedText>
        </View>

        <View style={styles.copyCard}>
          <ThemedText style={styles.sectionTitle}>产品能力</ThemedText>
          <ThemedText style={styles.copyText}>
            覆盖即时消息、音视频通话、互动直播、聊天室、信令、推送等核心场景，帮助开发者快速构建高质量的互动产品。
          </ThemedText>
          <ThemedText style={styles.sectionTitle}>适用场景</ThemedText>
          <ThemedText style={styles.copyText}>
            社交沟通、企业协作、在线教育、泛娱乐互动、智能硬件连接与更多实时通信业务。
          </ThemedText>
        </View>
      </ScrollView>
    </UIKitPage>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1
  },
  content: {
    padding: 16,
    gap: 16
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center'
  },
  logo: {
    width: 84,
    height: 84
  },
  heroTitle: {
    marginTop: 12,
    color: '#333333',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700'
  },
  heroSubtitle: {
    marginTop: 10,
    color: '#7E8794',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center'
  },
  copyCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 22
  },
  sectionTitle: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600'
  },
  copyText: {
    marginTop: 8,
    marginBottom: 18,
    color: '#7E8794',
    fontSize: 14,
    lineHeight: 22
  }
})

export default ProductIntroScreen
