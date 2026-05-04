import { router } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { NIMConfig } from '@/constants/NIMConfig'
import { NEUIKitColors, UIKitButton, UIKitTextInput } from '@/src/NEUIKit/rn'
import { authStore } from '@/stores'

const LoginScreen = observer(() => {
  const [mobile, setMobile] = useState(NIMConfig.defaultLogin.mobile)
  const [smsCode, setSmsCode] = useState(NIMConfig.defaultLogin.smsCode)
  const [error, setError] = useState('')
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [awaitingRegistrationConfirmation, setAwaitingRegistrationConfirmation] = useState(false)
  const [focusedField, setFocusedField] = useState<'mobile' | 'smsCode' | null>(null)
  const isAuthenticated = authStore.isAuthenticated
  const smsCountdown = authStore.smsCountdown

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/' as never)
    }
  }, [isAuthenticated])

  const smsText = useMemo(() => {
    return smsCountdown > 0 ? `${smsCountdown} 秒后重新获取` : '获取验证码'
  }, [smsCountdown])

  const handleRequestSmsCode = async () => {
    try {
      setError('')
      const result = await authStore.requestSmsCode(mobile)
      setAwaitingRegistrationConfirmation(result.isFirstRegister)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '验证码获取失败')
    }
  }

  const submitLogin = async (skipRegistrationCheck = false) => {
    try {
      setError('')

      if (awaitingRegistrationConfirmation && !skipRegistrationCheck) {
        setShowConsentModal(true)
        return
      }

      await authStore.loginWithSms(mobile, smsCode)
      router.replace('/' as never)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '登录失败')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.content}>
        <View style={styles.loginTabs}>
          <ThemedText style={styles.activeTabText}>验证码登录</ThemedText>
          <View style={styles.activeTabIndicator} />
        </View>

        <ThemedView style={styles.formCard}>
          <View style={[styles.inputLine, focusedField === 'mobile' && styles.inputLineFocused]}>
            <ThemedText style={styles.prefix}>+86</ThemedText>
            <UIKitTextInput
              placeholder="输入手机号"
              keyboardType="number-pad"
              maxLength={11}
              value={mobile}
              onChangeText={setMobile}
              onFocus={() => setFocusedField('mobile')}
              onBlur={() => setFocusedField(null)}
            />
            {!!mobile && (
              <Pressable style={styles.clearButton} onPress={() => setMobile('')}>
                <ThemedText style={styles.clearText}>×</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={[styles.inputLine, focusedField === 'smsCode' && styles.inputLineFocused]}>
            <UIKitTextInput
              placeholder="输入验证码"
              keyboardType="number-pad"
              value={smsCode}
              onChangeText={setSmsCode}
              onFocus={() => setFocusedField('smsCode')}
              onBlur={() => setFocusedField(null)}
            />
            <Pressable
              style={[styles.smsButton, authStore.smsCountdown > 0 && styles.smsButtonDisabled]}
              onPress={handleRequestSmsCode}
            >
              {authStore.isRequestingSms ? (
                <ActivityIndicator size="small" color="#337EFF" />
              ) : (
                <ThemedText style={styles.smsButtonText}>{smsText}</ThemedText>
              )}
            </Pressable>
          </View>

          {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

          <UIKitButton
            label="登录"
            onPress={() => submitLogin(false)}
            disabled={authStore.isLoggingIn}
            loading={authStore.isLoggingIn}
            style={styles.loginButton}
          />
        </ThemedView>
      </ThemedView>

      <Modal visible={showConsentModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowConsentModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <ThemedText style={styles.modalTitle}>温馨提示</ThemedText>
            <ThemedText style={styles.modalBody}>
              该手机号尚未注册，继续登录即视为同意服务协议与隐私政策。
            </ThemedText>
            <View style={styles.linkRow}>
              <Pressable
                onPress={async () => {
                  try {
                    await Linking.openURL('https://yunxin.163.com')
                  } catch {
                    setError('打开服务协议失败')
                  }
                }}
              >
                <ThemedText style={styles.linkText}>服务协议</ThemedText>
              </Pressable>
              <Pressable
                onPress={async () => {
                  try {
                    await Linking.openURL('https://yunxin.163.com')
                  } catch {
                    setError('打开隐私政策失败')
                  }
                }}
              >
                <ThemedText style={styles.linkText}>隐私政策</ThemedText>
              </Pressable>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondary]}
                onPress={() => setShowConsentModal(false)}
              >
                <ThemedText style={styles.modalSecondaryText}>不同意</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimary]}
                onPress={async () => {
                  setShowConsentModal(false)
                  await submitLogin(true)
                }}
              >
                <ThemedText style={styles.modalPrimaryText}>同意并继续</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 112,
    paddingBottom: 30
  },
  loginTabs: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 72
  },
  activeTabText: {
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '700',
    color: '#222222'
  },
  activeTabIndicator: {
    position: 'absolute',
    left: 10,
    bottom: -10,
    width: 90,
    height: 3,
    borderRadius: 2,
    backgroundColor: NEUIKitColors.primary
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    gap: 28
  },
  inputLine: {
    minHeight: 54,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE2EA',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  inputLineFocused: {
    borderBottomColor: NEUIKitColors.primary
  },
  prefix: {
    fontSize: 18,
    color: '#999999',
    borderRightWidth: 1,
    borderRightColor: '#D8DDE6',
    paddingRight: 12
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333333'
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8E9299'
  },
  clearText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 18
  },
  smsButton: {
    minWidth: 96,
    minHeight: 34,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  smsButtonDisabled: {
    opacity: 0.58
  },
  smsButtonText: {
    fontSize: 16,
    color: '#337EFF',
    fontWeight: '500'
  },
  errorText: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 18
  },
  loginButton: {
    marginTop: 52,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginButtonDisabled: {
    opacity: 0.7
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 28, 0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  modalCard: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 14
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F242C'
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4A525E'
  },
  linkRow: {
    flexDirection: 'row',
    gap: 18
  },
  linkText: {
    fontSize: 13,
    color: '#337EFF',
    fontWeight: '600'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12
  },
  modalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalPrimary: {
    backgroundColor: '#337EFF'
  },
  modalSecondary: {
    backgroundColor: '#F7F4F2'
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  modalSecondaryText: {
    color: '#4A525E',
    fontWeight: '700'
  }
})

export default LoginScreen
