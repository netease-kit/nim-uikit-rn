import { router } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
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
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { NEUIKitColors, UIKitButton, UIKitTextInput } from '@/src/NEUIKit/rn'
import { authStore } from '@/stores'
const CONSENT_SERVICE_URL = 'https://yunxin.163.com'
const CONSENT_PRIVACY_URL = 'https://yunxin.163.com'

function normalizeDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

const LoginScreen = observer(() => {
  const { t } = useAppTranslation()
  const [mobile, setMobile] = useState(NIMConfig.defaultLogin.mobile)
  const [smsCode, setSmsCode] = useState(NIMConfig.defaultLogin.smsCode)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [awaitingRegistrationConfirmation, setAwaitingRegistrationConfirmation] = useState(false)
  const [focusedField, setFocusedField] = useState<'mobile' | 'smsCode' | null>(null)
  const hasValidatedSession = authStore.hasValidatedSession
  const smsCountdown = authStore.smsCountdown

  useEffect(() => {
    if (hasValidatedSession) {
      router.replace('/' as never)
    }
  }, [hasValidatedSession])

  const smsText = useMemo(() => {
    return smsCountdown > 0
      ? t('loginRequestSmsCodeCountdown', { count: smsCountdown })
      : t('loginRequestSmsCode')
  }, [smsCountdown, t])

  const handleMobileChange = (value: string) => {
    setMobile(normalizeDigits(value, 11))
    setAwaitingRegistrationConfirmation(false)
  }

  const handleSmsCodeChange = (value: string) => {
    setSmsCode(normalizeDigits(value, 6))
  }

  const openConsentLink = async (url: string, fallbackMessage: string) => {
    try {
      await Linking.openURL(url)
    } catch {
      toast.info(fallbackMessage)
    }
  }

  const handleRequestSmsCode = async () => {
    if (!authStore.validateMobile(mobile)) {
      toast.info(t('loginInvalidSmsRequestMobile'))
      return
    }

    try {
      const result = await authStore.requestSmsCode(mobile)
      setAwaitingRegistrationConfirmation(result.isFirstRegister)
    } catch (requestError) {
      toast.info(requestError instanceof Error ? requestError.message : t('loginSmsCodeFailed'))
    }
  }

  const submitLogin = async (skipRegistrationCheck = false) => {
    if (!authStore.validateMobile(mobile)) {
      toast.info(t('loginInvalidMobile'))
      return
    }

    if (!authStore.validateSmsCode(smsCode)) {
      toast.info(t('loginInvalidSmsCode'))
      return
    }

    try {
      Keyboard.dismiss()

      if (awaitingRegistrationConfirmation && !skipRegistrationCheck) {
        setShowConsentModal(true)
        return
      }

      await authStore.loginWithSms(mobile, smsCode)
      router.replace('/' as never)
    } catch (loginError) {
      toast.info(loginError instanceof Error ? loginError.message : t('loginFailed'))
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.content}>
        <View style={styles.loginTabs}>
          <ThemedText style={styles.activeTabText}>{t('loginTitle')}</ThemedText>
          <View style={styles.activeTabIndicator} />
        </View>
        <ThemedText style={styles.loginHint}>{t('loginHint')}</ThemedText>

        <ThemedView style={styles.formCard}>
          <View style={[styles.inputLine, focusedField === 'mobile' && styles.inputLineFocused]}>
            <ThemedText style={styles.prefix}>+86</ThemedText>
            <UIKitTextInput
              placeholder={t('loginMobilePlaceholder')}
              keyboardType="number-pad"
              maxLength={11}
              value={mobile}
              onChangeText={handleMobileChange}
              onFocus={() => setFocusedField('mobile')}
              onBlur={() => setFocusedField(null)}
            />
            {!!mobile && (
              <Pressable style={styles.clearButton} onPress={() => handleMobileChange('')}>
                <ThemedText style={styles.clearText}>×</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={[styles.inputLine, focusedField === 'smsCode' && styles.inputLineFocused]}>
            <UIKitTextInput
              placeholder={t('loginSmsCodePlaceholder')}
              keyboardType="number-pad"
              maxLength={6}
              value={smsCode}
              onChangeText={handleSmsCodeChange}
              onFocus={() => setFocusedField('smsCode')}
              onBlur={() => setFocusedField(null)}
            />
            <Pressable
              style={[styles.smsButton, authStore.smsCountdown > 0 && styles.smsButtonDisabled]}
              onPress={handleRequestSmsCode}
              disabled={authStore.isRequestingSms || authStore.smsCountdown > 0}
            >
              {authStore.isRequestingSms ? (
                <ActivityIndicator size="small" color="#337EFF" />
              ) : (
                <ThemedText style={styles.smsButtonText}>{smsText}</ThemedText>
              )}
            </Pressable>
          </View>

          <UIKitButton
            label={t('loginButton')}
            onPress={() => submitLogin(false)}
            disabled={authStore.isLoggingIn}
            loading={authStore.isLoggingIn}
            style={styles.loginButton}
          />
          {authStore.isLoggingIn ? (
            <View style={styles.loggingInHintWrap}>
              <ThemedText style={styles.loggingInHintText}>{t('loginSigningInHint')}</ThemedText>
            </View>
          ) : null}
        </ThemedView>
      </ThemedView>

      <Modal visible={showConsentModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowConsentModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <ThemedText style={styles.modalTitle}>{t('loginConsentTitle')}</ThemedText>
            <ThemedText style={styles.modalBody}>
              {t('loginConsentBodyPrefix')}
              <ThemedText
                style={styles.linkText}
                onPress={() => openConsentLink(CONSENT_SERVICE_URL, t('loginOpenServiceFailed'))}
              >
                {t('loginConsentService')}
              </ThemedText>
              {t('loginConsentAnd')}
              <ThemedText
                style={styles.linkText}
                onPress={() => openConsentLink(CONSENT_PRIVACY_URL, t('loginOpenPrivacyFailed'))}
              >
                {t('loginConsentPrivacy')}
              </ThemedText>
              {t('loginConsentBodySuffix')}
            </ThemedText>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondary]}
                onPress={() => setShowConsentModal(false)}
              >
                <ThemedText style={styles.modalSecondaryText}>
                  {t('loginConsentDisagree')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimary]}
                onPress={async () => {
                  setShowConsentModal(false)
                  await submitLogin(true)
                }}
              >
                <ThemedText style={styles.modalPrimaryText}>{t('loginConsentAgree')}</ThemedText>
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
    marginBottom: 16
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
  loginHint: {
    color: '#666D78',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 52
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
  loginButton: {
    marginTop: 52,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loggingInHintWrap: {
    marginTop: -12,
    alignItems: 'center'
  },
  loggingInHintText: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18
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
