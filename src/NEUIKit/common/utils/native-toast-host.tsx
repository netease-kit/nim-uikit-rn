import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ToastType = 'info' | 'success' | 'warning' | 'error'

type NativeToastRequest = {
  message: string
  duration?: number
  type?: ToastType
}

type NativeToastHandler = (request: NativeToastRequest) => void

let activeHandler: NativeToastHandler | null = null
let pendingRequest: NativeToastRequest | null = null

export function showNativeToast(request: NativeToastRequest) {
  if (activeHandler) {
    activeHandler(request)
    return
  }

  pendingRequest = request
}

export function NativeToastHost() {
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const [message, setMessage] = useState('')
  const [toastType, setToastType] = useState<ToastType>('info')
  const [keyboardTopY, setKeyboardTopY] = useState<number | null>(null)
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(10)).current
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardTopY(event.endCoordinates.screenY)
    })
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardTopY(null)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [insets.bottom])

  useEffect(() => {
    activeHandler = (request) => {
      const nextMessage = request.message.trim()

      if (!nextMessage) {
        return
      }

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }

      setMessage(nextMessage)
      setToastType(request.type || 'info')
      opacity.stopAnimation()
      translateY.stopAnimation()
      opacity.setValue(0)
      translateY.setValue(10)

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true
        })
      ]).start()

      hideTimerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true
          }),
          Animated.timing(translateY, {
            toValue: 8,
            duration: 180,
            useNativeDriver: true
          })
        ]).start(({ finished }) => {
          if (finished) {
            setMessage('')
          }
        })
      }, request.duration ?? 2000)
    }

    if (pendingRequest) {
      activeHandler(pendingRequest)
      pendingRequest = null
    }

    return () => {
      activeHandler = null

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [opacity, translateY])

  if (!message) {
    return null
  }

  const lowerMiddleOffset = Math.max(96, Math.round(windowHeight * 0.18))
  const keyboardAvoidanceOffset =
    keyboardTopY === null ? 0 : Math.max(0, windowHeight - keyboardTopY - insets.bottom)

  return (
    <View
      pointerEvents="none"
      style={[
        styles.viewport,
        {
          bottom: keyboardAvoidanceOffset + Math.max(insets.bottom, 12) + lowerMiddleOffset
        }
      ]}
    >
      <Animated.View
        style={[
          styles.bubble,
          {
            backgroundColor: toastBackgroundByType[toastType],
            opacity,
            transform: [{ translateY }]
          }
        ]}
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999
  },
  bubble: {
    maxWidth: '100%',
    borderRadius: 10,
    backgroundColor: 'rgba(31, 36, 44, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  }
})

const toastBackgroundByType: Record<ToastType, string> = {
  info: 'rgba(0, 0, 0, 0.78)',
  success: 'rgba(0, 0, 0, 0.78)',
  warning: 'rgba(250, 173, 20, 0.9)',
  error: 'rgba(255, 77, 79, 0.9)'
}
