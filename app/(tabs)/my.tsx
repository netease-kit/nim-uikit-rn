import * as Clipboard from 'expo-clipboard'
import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { UIKitAvatar, UIKitIcon, UIKitPage } from '@/src/NEUIKit/rn'
import { authStore, userStore } from '@/stores'

const MyScreen = observer(() => {
  const profile = userStore.selfProfile
  const account = profile?.accountId || authStore.session?.account || '-'
  const displayName = profile?.name || '未设置昵称'

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable style={styles.heroCard} onPress={() => router.push('/user/my-detail' as never)}>
        <UIKitAvatar
          uri={profile?.avatar}
          label={profile?.name || authStore.session?.mobile || '我'}
          size={88}
        />
        <View style={styles.heroMeta}>
          <ThemedText style={styles.heroTitle} numberOfLines={1}>
            {displayName}
          </ThemedText>
          <Pressable
            style={styles.accountRow}
            onPress={async () => {
              if (account === '-') {
                return
              }

              await Clipboard.setStringAsync(account)
              Alert.alert('已复制账号', account)
            }}
          >
            <ThemedText style={styles.accountText}>帐号:{account}</ThemedText>
          </Pressable>
        </View>
        <UIKitIcon type="icon-jiantou" size={18} tintColor="#A6AFBB" />
      </Pressable>

      <View style={styles.menuCard}>
        <MenuRow
          icon="icon-guanyu"
          iconColor="#60CFA7"
          title="关于云信"
          onPress={() => router.push('/user/aboutNetease' as never)}
        />
        <MenuDivider />
        <MenuRow
          icon="icon-shezhi1"
          iconColor="#F6B246"
          title="设置"
          onPress={() => router.push('/user/setting' as never)}
        />
      </View>
    </UIKitPage>
  )
})

function MenuRow({
  icon,
  iconColor,
  title,
  onPress
}: {
  icon: 'icon-guanyu' | 'icon-shezhi1'
  iconColor: string
  title: string
  onPress: () => void
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuLeading}>
        <UIKitIcon type={icon} size={24} tintColor={iconColor} />
        <ThemedText style={styles.menuTitle}>{title}</ThemedText>
      </View>
      <UIKitIcon type="icon-jiantou" size={18} tintColor="#A6AFBB" />
    </Pressable>
  )
}

function MenuDivider() {
  return <View style={styles.menuDivider} />
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: 34
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18
  },
  heroMeta: {
    flex: 1
  },
  heroTitle: {
    color: '#333333',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700'
  },
  accountRow: {
    marginTop: 8
  },
  accountText: {
    color: '#666D78',
    fontSize: 16,
    lineHeight: 24
  },
  menuCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF'
  },
  menuRow: {
    minHeight: 78,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  menuLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18
  },
  menuTitle: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24
  },
  menuDivider: {
    height: 1,
    marginLeft: 64,
    backgroundColor: '#EEF2F7'
  }
})

export default MyScreen
