import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { NEUIKitColors, UIKitIcon } from '@/src/NEUIKit/rn'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <UIKitIcon type="logo" width={86} height={86} />
        <ThemedText style={styles.brandName}>网易云信</ThemedText>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login' as never)}>
        <ThemedText style={styles.loginButtonText}>注册/登录</ThemedText>
      </TouchableOpacity>

      <View style={styles.footer}>
        <UIKitIcon type="logo" width={18} height={18} />
        <ThemedText style={styles.footerText}>网易云信</ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30
  },
  brand: {
    position: 'absolute',
    top: '28%',
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  brandName: {
    marginTop: 18,
    color: '#333333',
    fontSize: 39,
    lineHeight: 54,
    fontWeight: '700'
  },
  loginButton: {
    position: 'absolute',
    left: 30,
    right: 30,
    bottom: 292,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: NEUIKitColors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600'
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  footerText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500'
  }
})
