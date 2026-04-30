import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Tabs } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { UIKitIcon } from '@/src/NEUIKit/rn'
import { conversationStore, friendStore, imStoreV2Bridge } from '@/stores'

const TAB_TOUCH_WIDTH = 64

const TabLayout = observer(() => {
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
          title: '消息',
          tabBarBadge:
            (imStoreV2Bridge.totalUnread || conversationStore.totalUnread) > 0
              ? imStoreV2Bridge.totalUnread || conversationStore.totalUnread
              : undefined,
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
          title: '通讯录',
          tabBarBadge:
            friendStore.unreadApplicationCount > 0 ? friendStore.unreadApplicationCount : undefined,
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
          title: '我的',
          tabBarIcon: ({ focused }) => (
            <UIKitIcon type={focused ? 'tab-me-selected' : 'tab-me'} size={28} />
          )
        }}
      />
    </Tabs>
  )
})

const FigmaMessageTabBar = observer(({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets()
  const items: {
    key: string
    routeName: 'index' | 'contacts' | 'my'
    label: string
    visualWidth: number
    labelWidth: number
    labelLeft: number
    iconLeft: number
    icon: React.ReactNode
    selectedIcon: React.ReactNode
  }[] = [
    {
      key: 'index',
      routeName: 'index',
      label: '消息',
      visualWidth: 28,
      labelWidth: 20,
      labelLeft: 4,
      iconLeft: 0,
      icon: <UIKitIcon type="tab-conversation" size={28} />,
      selectedIcon: <UIKitIcon type="tab-conversation-selected" size={28} />
    },
    {
      key: 'contacts',
      routeName: 'contacts',
      label: '通讯录',
      visualWidth: 30,
      labelWidth: 30,
      labelLeft: 0,
      iconLeft: 1,
      icon: <UIKitIcon type="tab-contact" size={28} />,
      selectedIcon: <UIKitIcon type="tab-contact-selected" size={28} />
    },
    {
      key: 'my',
      routeName: 'my',
      label: '我的',
      visualWidth: 28,
      labelWidth: 20,
      labelLeft: 4,
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
                </View>
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    { color: labelColor, left: item.labelLeft, width: item.labelWidth }
                  ]}
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
  tabLabel: {
    position: 'absolute',
    top: 32,
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
