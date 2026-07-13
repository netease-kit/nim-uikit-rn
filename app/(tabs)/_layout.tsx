import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Tabs } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAppTranslation } from '@/hooks/useAppTranslation'
import { UIKitIcon } from '@/src/NEUIKit/rn'
import { conversationStore, friendStore, imStoreV2Bridge } from '@/stores'

const TAB_TOUCH_WIDTH = 64

function getMessageUnreadTotal() {
  return imStoreV2Bridge.hasBoundStore
    ? imStoreV2Bridge.messageTabUnreadTotal
    : conversationStore.totalUnread
}

const TabLayout = observer(() => {
  const { t } = useAppTranslation()
  const messageUnread = getMessageUnreadTotal()

  return (
    <Tabs
      tabBar={(props) => <FigmaMessageTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#FFFFFF'
        },
        headerTitleStyle: {
          color: '#222222',
          fontSize: 20,
          fontWeight: '700'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabMessages'),
          tabBarBadge: messageUnread > 0 ? messageUnread : undefined,
          tabBarIcon: ({ focused }) => (
            <UIKitIcon
              type={focused ? 'tab-conversation-selected' : 'tab-conversation'}
              size={28}
            />
          )
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: t('tabContacts'),
          tabBarBadge:
            friendStore.displayUnreadApplicationCount > 0
              ? friendStore.displayUnreadApplicationCount
              : undefined,
          tabBarIcon: ({ focused }) => (
            <View>
              <UIKitIcon type={focused ? 'tab-contact-selected' : 'tab-contact'} size={28} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: t('tabMe'),
          tabBarIcon: ({ focused }) => (
            <UIKitIcon type={focused ? 'tab-me-selected' : 'tab-me'} size={28} />
          )
        }}
      />
    </Tabs>
  )
})

const FigmaMessageTabBar = observer(({ state, navigation }: BottomTabBarProps) => {
  const { t } = useAppTranslation()
  const insets = useSafeAreaInsets()
  const messageUnread = getMessageUnreadTotal()
  const contactUnread = friendStore.displayUnreadApplicationCount
  const items: {
    key: string
    routeName: 'index' | 'contacts' | 'my'
    label: string
    visualWidth: number
    iconLeft: number
    showUnreadDot?: boolean
    icon: React.ReactNode
    selectedIcon: React.ReactNode
  }[] = [
    {
      key: 'index',
      routeName: 'index',
      label: t('tabMessages'),
      visualWidth: 28,
      iconLeft: 0,
      showUnreadDot: messageUnread > 0,
      icon: <UIKitIcon type="tab-conversation" size={28} />,
      selectedIcon: <UIKitIcon type="tab-conversation-selected" size={28} />
    },
    {
      key: 'contacts',
      routeName: 'contacts',
      label: t('tabContacts'),
      visualWidth: 30,
      iconLeft: 1,
      showUnreadDot: contactUnread > 0,
      icon: <UIKitIcon type="tab-contact" size={28} />,
      selectedIcon: <UIKitIcon type="tab-contact-selected" size={28} />
    },
    {
      key: 'my',
      routeName: 'my',
      label: t('tabMe'),
      visualWidth: 28,
      iconLeft: 0,
      icon: <UIKitIcon type="tab-me" size={28} />,
      selectedIcon: <UIKitIcon type="tab-me-selected" size={28} />
    }
  ]

  const activeRoute = state.routes[state.index]?.name
  const bottomInset = Math.max(insets.bottom, 34)

  return (
    <View style={[styles.tabBar, { height: 63 + bottomInset }]}>
      <View style={styles.tabContent}>
        {items.map((item) => {
          const focused = 'routeName' in item && item.routeName === activeRoute
          const labelColor = focused ? '#337EFF' : '#999999'
          const route = state.routes.find((routeItem) => routeItem.name === item.routeName)

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.tabTouchItem}
              activeOpacity={0.78}
              onPress={() => {
                if (!route) {
                  return
                }

                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true
                })

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name)
                }
              }}
            >
              <View style={[styles.tabVisualItem, { width: item.visualWidth }]}>
                <View style={[styles.tabIconWrap, { left: item.iconLeft }]}>
                  {focused ? item.selectedIcon : item.icon}
                  {item.showUnreadDot ? <View style={styles.tabUnreadDot} /> : null}
                </View>
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  ellipsizeMode="clip"
                  style={[styles.tabLabel, { color: labelColor }]}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  tabBar: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E9EFF5',
    backgroundColor: '#F6F8FA'
  },
  tabContent: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 46,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  tabTouchItem: {
    width: TAB_TOUCH_WIDTH,
    height: 46,
    alignItems: 'center'
  },
  tabVisualItem: {
    width: 28,
    height: 46,
    alignItems: 'center'
  },
  tabIconWrap: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabUnreadDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4F'
  },
  tabLabel: {
    position: 'absolute',
    top: 32,
    left: -(TAB_TOUCH_WIDTH - 28) / 2,
    width: TAB_TOUCH_WIDTH,
    height: 14,
    fontFamily: 'PingFang SC',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '400',
    letterSpacing: 0,
    textAlign: 'center',
    includeFontPadding: false
  }
})

export default TabLayout
