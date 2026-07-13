import { Image } from 'expo-image'
import React from 'react'
import {
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { EMOJI_RENDER_ICON_MAP_CONFIG } from '@/src/NEUIKit/common/utils/emoji'
import { parseText } from '@/src/NEUIKit/common/utils/parseText'
import { translateCurrentApp } from '@/utils/app-language'

import { NEUIKitIconName, UIKitIcon } from './icon'
import {
  getUIKitAppellation,
  getUIKitAvatarColor,
  getUIKitAvatarLabel,
  getUIKitAvatarUri,
  getUIKitUserAvatarLabel
} from './identity'
import { NEUIKitColors, NEUIKitMetrics } from './theme'

export type UIKitSwipeAction = {
  label: string
  color: string
  onPress: () => void
}

export type UIKitMenuAction = {
  label: string
  icon?: NEUIKitIconName
  danger?: boolean
  onPress: () => void
}

const DEFAULT_EMPTY_IMAGE = require('../static/empty.png')

const webTextInputFocusReset =
  Platform.OS === 'web'
    ? ({
        outlineStyle: 'none',
        outlineWidth: 0,
        boxShadow: 'none'
      } as unknown as TextStyle)
    : null

export function UIKitPage({
  children,
  style
}: {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}) {
  return <ThemedView style={[styles.page, style]}>{children}</ThemedView>
}

export function UIKitWhitePage({
  children,
  style
}: {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}) {
  return <ThemedView style={[styles.whitePage, style]}>{children}</ThemedView>
}

export function UIKitHero({
  logo,
  kicker,
  title,
  subtitle
}: {
  logo?: number
  kicker?: string
  title: string
  subtitle?: string
}) {
  return (
    <View style={styles.hero}>
      {logo ? <Image source={logo} style={styles.heroLogo} contentFit="contain" /> : null}
      {kicker ? <ThemedText style={styles.heroKicker}>{kicker}</ThemedText> : null}
      <ThemedText style={styles.heroTitle}>{title}</ThemedText>
      {subtitle ? <ThemedText style={styles.heroSubtitle}>{subtitle}</ThemedText> : null}
    </View>
  )
}

export function UIKitInputShell({
  children,
  focused = false,
  style
}: {
  children: React.ReactNode
  focused?: boolean
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.inputShell, focused && styles.inputShellFocused, style]}>{children}</View>
  )
}

export function UIKitTextInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor="#8D97A5"
      {...props}
      style={[styles.textInput, webTextInputFocusReset, props.style]}
    />
  )
}

export function UIKitButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  style
}: {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  style?: StyleProp<ViewStyle>
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? NEUIKitColors.primary : '#FFFFFF'} />
      ) : (
        <ThemedText
          style={[
            styles.buttonText,
            variant === 'secondary' && styles.secondaryButtonText,
            variant === 'danger' && styles.dangerButtonText
          ]}
        >
          {label}
        </ThemedText>
      )}
    </TouchableOpacity>
  )
}

export function UIKitHeaderBackButton({
  onPress,
  tintColor = '#111827'
}: {
  onPress: () => void
  tintColor?: string
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={translateCurrentApp('actionBack' as never)}
      hitSlop={10}
      onPress={onPress}
      style={styles.headerBackButton}
    >
      <UIKitIcon type="icon-zuojiantou" size={22} tintColor={tintColor} />
    </TouchableOpacity>
  )
}

export function UIKitAvatar({
  uri,
  label,
  size = NEUIKitMetrics.avatar,
  color = NEUIKitColors.primary,
  recyclingKey
}: {
  uri?: string
  label?: string
  size?: number
  color?: string
  recyclingKey?: string
}) {
  const radius = size / 2

  if (uri) {
    return (
      <Image
        source={uri}
        recyclingKey={recyclingKey || uri}
        style={[styles.avatar, { width: size, height: size, borderRadius: radius }]}
      />
    )
  }

  return (
    <View
      style={[
        styles.avatarFallback,
        { width: size, height: size, borderRadius: radius, backgroundColor: color }
      ]}
    >
      <ThemedText style={[styles.avatarText, size >= 52 && styles.largeAvatarText]}>
        {(label || '-').slice(0, 2).toUpperCase()}
      </ThemedText>
    </View>
  )
}

export function UIKitUserAvatar({
  account,
  teamId,
  avatar,
  fallbackLabel,
  size = NEUIKitMetrics.avatar,
  onlineStatus
}: {
  account: string
  teamId?: string
  avatar?: string
  fallbackLabel?: string
  size?: number
  onlineStatus?: string
}) {
  const statusDotSize = Math.max(10, Math.round(size * 0.24))
  const statusDotBorder = Math.max(2, Math.round(size * 0.05))
  const resolvedAvatarUri = getUIKitAvatarUri(account, avatar, { teamId })
  const avatarRecyclingKey = `${account}:${teamId || ''}:${resolvedAvatarUri || 'fallback'}:${size}`

  return (
    <View style={{ width: size, height: size }}>
      <UIKitAvatar
        uri={resolvedAvatarUri}
        label={
          teamId
            ? getUIKitAvatarLabel({ account, teamId })
            : getUIKitUserAvatarLabel({ account, explicitLabel: fallbackLabel })
        }
        size={size}
        color={getUIKitAvatarColor(account)}
        recyclingKey={avatarRecyclingKey}
      />
      {onlineStatus ? (
        <View
          style={[
            styles.avatarOnlineDot,
            {
              width: statusDotSize,
              height: statusDotSize,
              borderRadius: statusDotSize / 2,
              borderWidth: statusDotBorder
            },
            onlineStatus === translateCurrentApp('commonOnline')
              ? styles.avatarOnlineDotActive
              : styles.avatarOnlineDotInactive
          ]}
        />
      ) : null}
    </View>
  )
}

export function UIKitAppellation({
  account,
  teamId,
  ignoreAlias,
  nickFromMsg,
  style,
  numberOfLines = 1
}: {
  account: string
  teamId?: string
  ignoreAlias?: boolean
  nickFromMsg?: string
  style?: StyleProp<TextStyle>
  numberOfLines?: number
}) {
  return (
    <ThemedText numberOfLines={numberOfLines} style={style}>
      {getUIKitAppellation({ account, teamId, ignoreAlias, nickFromMsg })}
    </ThemedText>
  )
}

export function UIKitBadge({
  value,
  muted = false,
  dot = false
}: {
  value?: number
  muted?: boolean
  dot?: boolean
}) {
  if (!value) {
    return null
  }

  return (
    <View style={[styles.badge, muted && styles.badgeMuted, dot && styles.badgeDot]}>
      {dot ? null : <ThemedText style={styles.badgeText}>{value > 99 ? '99+' : value}</ThemedText>}
    </View>
  )
}

export function UIKitSearchEntry({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.searchEntry} onPress={onPress}>
      <UIKitIcon type="icon-sousuo" size={18} />
      <ThemedText style={styles.searchEntryText}>{label}</ThemedText>
    </TouchableOpacity>
  )
}

export function UIKitNoticeBanner({
  text,
  tone = 'danger'
}: {
  text: string
  tone?: 'danger' | 'warning'
}) {
  return (
    <View
      style={[
        styles.noticeBanner,
        tone === 'danger' ? styles.noticeBannerDanger : styles.noticeBannerWarning
      ]}
    >
      <ThemedText
        style={[
          styles.noticeBannerText,
          tone === 'danger' ? styles.noticeBannerDangerText : styles.noticeBannerWarningText
        ]}
      >
        {text}
      </ThemedText>
    </View>
  )
}

export function UIKitSectionHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      {meta ? <ThemedText style={styles.sectionMeta}>{meta}</ThemedText> : null}
    </View>
  )
}

export function UIKitConversationRow({
  title,
  subtitle,
  avatar,
  avatarAccount,
  avatarTeamId,
  onlineStatus,
  badge,
  meta,
  pinned,
  muted,
  onPress,
  onLongPress
}: {
  title: string
  subtitle?: string
  avatar?: string
  avatarAccount?: string
  avatarTeamId?: string
  onlineStatus?: string
  badge?: number
  meta?: string
  pinned?: boolean
  muted?: boolean
  onPress?: () => void
  onLongPress?: () => void
}) {
  const subtitleValue = subtitle || ''
  const mentionPrefix = translateCurrentApp('conversationMentionPrefix' as never)
  const subtitlePrefix = subtitleValue.startsWith(mentionPrefix) ? mentionPrefix : ''
  const subtitleContent = subtitlePrefix
    ? subtitleValue.slice(subtitlePrefix.length)
    : subtitleValue
  const subtitleParts = React.useMemo(() => parseText(subtitleContent), [subtitleContent])

  return (
    <Pressable
      style={({ pressed }) => [
        styles.conversationRow,
        pinned && styles.conversationRowPinned,
        pressed && styles.conversationRowPressed
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.conversationAvatarWrap}>
        {avatarAccount ? (
          <UIKitUserAvatar
            account={avatarAccount}
            teamId={avatarTeamId}
            avatar={avatar}
            size={38}
            onlineStatus={onlineStatus}
          />
        ) : (
          <UIKitAvatar
            uri={avatar}
            label={title}
            size={38}
            recyclingKey={`${title}:${avatar || ''}`}
          />
        )}
        <UIKitBadge value={badge} muted={muted} dot={!!muted} />
      </View>

      <View style={styles.conversationBody}>
        {meta || muted ? (
          <View style={styles.conversationMetaWrap}>
            {meta ? (
              <ThemedText numberOfLines={1} style={styles.conversationTime}>
                {meta}
              </ThemedText>
            ) : null}
            {muted ? (
              <View style={styles.conversationMuteIconWrap}>
                <UIKitIcon type="icon-xiaoximiandarao" size={13} />
              </View>
            ) : null}
          </View>
        ) : null}
        <View style={styles.conversationTop}>
          <View style={styles.conversationTitleWrap}>
            <ThemedText numberOfLines={1} style={styles.conversationTitle}>
              {title}
            </ThemedText>
          </View>
        </View>

        {subtitle ? (
          <View style={styles.conversationSubtitleWrap}>
            {subtitlePrefix ? (
              <ThemedText
                numberOfLines={1}
                style={[styles.conversationSubtitle, styles.conversationMentionPrefix]}
              >
                {translateCurrentApp('conversationMentionBadge' as never)}
              </ThemedText>
            ) : null}
            {subtitleParts.length > 0 ? (
              <View style={styles.conversationSubtitleInline}>
                {subtitleParts.map((item) => {
                  if (item.type === 'emoji') {
                    const iconType = EMOJI_RENDER_ICON_MAP_CONFIG[item.value] as
                      | NEUIKitIconName
                      | undefined

                    if (!iconType) {
                      return (
                        <ThemedText
                          key={item.key}
                          numberOfLines={1}
                          style={styles.conversationSubtitle}
                        >
                          {item.value}
                        </ThemedText>
                      )
                    }

                    return (
                      <View key={item.key} style={styles.conversationSubtitleEmoji}>
                        <UIKitIcon type={iconType} size={16} />
                      </View>
                    )
                  }

                  return (
                    <ThemedText
                      key={item.key}
                      numberOfLines={1}
                      style={styles.conversationSubtitle}
                    >
                      {item.value}
                    </ThemedText>
                  )
                })}
              </View>
            ) : (
              <ThemedText numberOfLines={1} style={styles.conversationSubtitle}>
                {subtitleContent}
              </ThemedText>
            )}
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

export function UIKitListRow({
  title,
  subtitle,
  icon,
  iconColor = NEUIKitColors.primary,
  avatar,
  avatarAccount,
  avatarTeamId,
  badge,
  meta,
  pinned,
  muted,
  danger,
  onPress,
  onLongPress,
  right,
  showChevron = true,
  titleStyle
}: {
  title: string
  subtitle?: string
  icon?: NEUIKitIconName
  iconColor?: string
  avatar?: string
  avatarAccount?: string
  avatarTeamId?: string
  badge?: number
  meta?: string
  pinned?: boolean
  muted?: boolean
  danger?: boolean
  onPress?: () => void
  onLongPress?: () => void
  right?: React.ReactNode
  showChevron?: boolean
  titleStyle?: StyleProp<TextStyle>
}) {
  return (
    <Pressable
      style={[styles.row, pinned && styles.pinnedRow]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.rowAvatarWrap}>
        {icon ? (
          <View style={[styles.iconAvatar, { backgroundColor: iconColor }]}>
            <UIKitIcon type={icon} size={22} />
          </View>
        ) : avatarAccount ? (
          <UIKitUserAvatar account={avatarAccount} teamId={avatarTeamId} avatar={avatar} />
        ) : (
          <UIKitAvatar uri={avatar} label={title} />
        )}
        <UIKitBadge value={badge} muted={muted} dot={!!muted} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <View style={styles.rowTitleWrap}>
            {pinned ? <UIKitIcon type="icon-xiaoxizhiding" size={14} /> : null}
            <ThemedText
              type="defaultSemiBold"
              numberOfLines={1}
              style={[styles.rowTitle, danger && styles.dangerText, titleStyle]}
            >
              {title}
            </ThemedText>
            {muted ? <UIKitIcon type="icon-xiaoximiandarao" size={14} /> : null}
          </View>
          {meta ? <ThemedText style={styles.rowMeta}>{meta}</ThemedText> : null}
        </View>
        {subtitle ? (
          <ThemedText numberOfLines={1} style={styles.rowSubtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {right || (showChevron ? <UIKitIcon type="icon-jiantou" size={18} /> : null)}
    </Pressable>
  )
}

export function UIKitDropdownMenu({
  visible,
  actions,
  onClose,
  top = 84,
  right = 16,
  width = 182
}: {
  visible: boolean
  actions: UIKitMenuAction[]
  onClose: () => void
  top?: number
  right?: number
  width?: number
}) {
  if (!visible) {
    return null
  }

  return (
    <Pressable style={styles.dropdownOverlay} onPress={onClose}>
      <Pressable style={[styles.dropdownCard, { top, right, width }]} onPress={() => undefined}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.dropdownRow, index < actions.length - 1 && styles.dropdownRowDivider]}
            onPress={action.onPress}
          >
            {action.icon ? <UIKitIcon type={action.icon} size={22} tintColor="#69707D" /> : null}
            <ThemedText style={[styles.dropdownText, action.danger && styles.dangerText]}>
              {action.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </Pressable>
    </Pressable>
  )
}

export function UIKitSwipeActionRow({
  children,
  actions,
  open,
  onOpen,
  onClose
}: {
  children: React.ReactNode
  actions: UIKitSwipeAction[]
  open?: boolean
  onOpen?: () => void
  onClose?: () => void
}) {
  const actionWidth = actions.length * 100
  const translateX = React.useRef(new Animated.Value(0)).current

  const animateTo = React.useCallback(
    (value: number) => {
      Animated.spring(translateX, {
        toValue: value,
        useNativeDriver: true,
        tension: 90,
        friction: 12
      }).start()
    },
    [translateX]
  )

  React.useEffect(() => {
    animateTo(open ? -actionWidth : 0)
  }, [actionWidth, animateTo, open])

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderMove: (_, gestureState) => {
          const base = open ? -actionWidth : 0
          const next = Math.max(-actionWidth, Math.min(0, base + gestureState.dx))
          translateX.setValue(next)
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldOpen = open ? gestureState.dx < actionWidth / 3 : gestureState.dx < -40

          if (shouldOpen) {
            onOpen?.()
            animateTo(-actionWidth)
            return
          }

          onClose?.()
          animateTo(0)
        },
        onPanResponderTerminate: () => {
          animateTo(open ? -actionWidth : 0)
        }
      }),
    [actionWidth, animateTo, onClose, onOpen, open, translateX]
  )

  return (
    <View style={styles.swipeRow}>
      <View style={[styles.swipeActions, { width: actionWidth }]}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.swipeActionButton, { backgroundColor: action.color }]}
            onPress={action.onPress}
          >
            <ThemedText style={styles.swipeActionText}>{action.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      <Animated.View
        style={[styles.swipeContent, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  )
}

export function UIKitEmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.empty}>
      <Image source={DEFAULT_EMPTY_IMAGE} style={styles.emptyImage} contentFit="contain" />
      <View style={styles.emptyTextWrap}>
        <ThemedText
          lightColor={NEUIKitColors.title}
          darkColor={NEUIKitColors.title}
          style={styles.emptyTitle}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText lightColor="#6B7280" darkColor="#6B7280" style={styles.emptySubtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </View>
  )
}

export function UIKitActionSheet({
  visible,
  title,
  actions,
  onClose
}: {
  visible: boolean
  title?: string
  actions: { label: string; danger?: boolean; onPress: () => void }[]
  onClose: () => void
}) {
  const insets = useSafeAreaInsets()

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.sheetMask, { paddingBottom: Math.max(insets.bottom, 12) }]}
        onPress={onClose}
      >
        <Pressable style={styles.sheetPanel} onPress={() => undefined}>
          <View style={styles.sheetGroup}>
            {title ? (
              <View style={styles.sheetTitleWrap}>
                <ThemedText style={styles.sheetTitle}>{title}</ThemedText>
              </View>
            ) : null}
            {actions.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.sheetRow, index === actions.length - 1 && styles.sheetRowLast]}
                onPress={item.onPress}
              >
                <ThemedText style={[styles.sheetText, item.danger && styles.dangerText]}>
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.sheetCancelButton} onPress={onClose}>
            <ThemedText style={styles.sheetCancelText}>
              {translateCurrentApp('cancelText' as never)}
            </ThemedText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: NEUIKitColors.page
  },
  whitePage: {
    flex: 1,
    backgroundColor: NEUIKitColors.white
  },
  hero: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 36
  },
  heroLogo: {
    width: 68,
    height: 68,
    marginBottom: 22
  },
  heroKicker: {
    fontSize: 14,
    color: '#666B73',
    marginBottom: 8,
    textAlign: 'center'
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    color: NEUIKitColors.title,
    marginBottom: 8,
    textAlign: 'center'
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: NEUIKitColors.mutedText,
    textAlign: 'center'
  },
  inputShell: {
    minHeight: 50,
    borderRadius: NEUIKitMetrics.radius,
    backgroundColor: NEUIKitColors.white,
    borderWidth: 1,
    borderColor: NEUIKitColors.border,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  inputShellFocused: {
    borderColor: NEUIKitColors.primary,
    backgroundColor: '#F7FAFF',
    shadowColor: NEUIKitColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 1
  },
  textInput: {
    flex: 1,
    minHeight: 50,
    fontSize: 16,
    color: NEUIKitColors.text
  },
  button: {
    minHeight: 50,
    borderRadius: NEUIKitMetrics.radius,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButton: {
    backgroundColor: NEUIKitColors.primary
  },
  secondaryButton: {
    backgroundColor: '#F4F4F5'
  },
  dangerButton: {
    backgroundColor: NEUIKitColors.danger
  },
  disabledButton: {
    opacity: 0.7
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700'
  },
  secondaryButtonText: {
    color: NEUIKitColors.primary
  },
  headerBackButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dangerButtonText: {
    color: '#FFFFFF'
  },
  avatar: {
    backgroundColor: '#E5E7EB'
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  largeAvatarText: {
    fontSize: 24
  },
  avatarOnlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    borderColor: '#FFFFFF'
  },
  avatarOnlineDotActive: {
    backgroundColor: '#26B96B'
  },
  avatarOnlineDotInactive: {
    backgroundColor: '#C2C8D1'
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NEUIKitColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  badgeMuted: {
    backgroundColor: '#C7CDD4'
  },
  badgeDot: {
    minWidth: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    paddingHorizontal: 0
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  searchEntry: {
    minHeight: 36,
    borderRadius: NEUIKitMetrics.radius,
    backgroundColor: NEUIKitColors.white,
    marginHorizontal: 20,
    marginVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  searchEntryText: {
    color: '#9CA3AF'
  },
  noticeBanner: {
    minHeight: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  noticeBannerDanger: {
    backgroundColor: '#FFE5EA'
  },
  noticeBannerWarning: {
    backgroundColor: '#FFF5E1'
  },
  noticeBannerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },
  noticeBannerDangerText: {
    color: '#FF5A6B'
  },
  noticeBannerWarningText: {
    color: '#EB9718'
  },
  sectionHeader: {
    minHeight: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: NEUIKitColors.page,
    paddingHorizontal: NEUIKitMetrics.horizontalPadding,
    paddingTop: 12,
    paddingBottom: 8
  },
  sectionMeta: {
    fontSize: 12,
    color: '#6B7280'
  },
  row: {
    minHeight: NEUIKitMetrics.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUIKitColors.white,
    paddingHorizontal: NEUIKitMetrics.horizontalPadding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: NEUIKitColors.divider
  },
  swipeRow: {
    overflow: 'hidden',
    backgroundColor: NEUIKitColors.white
  },
  swipeActions: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row'
  },
  swipeActionButton: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  },
  swipeContent: {
    backgroundColor: NEUIKitColors.white
  },
  pinnedRow: {
    backgroundColor: '#F3F5F7'
  },
  rowAvatarWrap: {
    position: 'relative',
    marginRight: 12
  },
  iconAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowBody: {
    flex: 1,
    minWidth: 0
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  rowTitleWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  rowTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    color: NEUIKitColors.text
  },
  rowMeta: {
    width: 90,
    textAlign: 'right',
    fontSize: 14,
    color: '#CCCCCC'
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: NEUIKitColors.mutedText
  },
  conversationRow: {
    minHeight: 68,
    backgroundColor: NEUIKitColors.white,
    paddingLeft: 18,
    paddingRight: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  conversationRowPinned: {
    backgroundColor: '#F3F5F7'
  },
  conversationRowPressed: {
    backgroundColor: '#EEF1F5'
  },
  conversationAvatarWrap: {
    position: 'relative',
    width: 38,
    height: 38,
    marginRight: 12
  },
  conversationBody: {
    flex: 1,
    minWidth: 0,
    paddingRight: 82
  },
  conversationTop: {
    minHeight: 22,
    justifyContent: 'center'
  },
  conversationTitleWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  conversationTitle: {
    flex: 1,
    color: '#333333',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500'
  },
  conversationTime: {
    color: '#C7CDD4',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right'
  },
  conversationMetaWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 72,
    alignItems: 'flex-end'
  },
  conversationMuteIconWrap: {
    minHeight: 18,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  conversationSubtitle: {
    color: '#A6ADB6',
    fontSize: 13,
    lineHeight: 18
  },
  conversationSubtitleWrap: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden'
  },
  conversationSubtitleInline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden'
  },
  conversationSubtitleEmoji: {
    marginHorizontal: 1
  },
  conversationMentionPrefix: {
    color: NEUIKitColors.danger
  },
  dangerText: {
    color: NEUIKitColors.danger
  },
  empty: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 48
  },
  emptyImage: {
    width: 125,
    height: 100,
    marginBottom: 10
  },
  emptyTextWrap: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 12
  },
  emptyTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
    color: '#A6AFBB'
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#A6AFBB',
    textAlign: 'center'
  },
  sheetMask: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.36)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  sheetPanel: {
    gap: 8
  },
  sheetGroup: {
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: NEUIKitColors.white
  },
  sheetTitleWrap: {
    minHeight: 56,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEC'
  },
  sheetTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8E8E93',
    textAlign: 'center'
  },
  sheetRow: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEC'
  },
  sheetRowLast: {
    borderBottomWidth: 0
  },
  sheetText: {
    fontSize: 17,
    lineHeight: 24,
    color: '#111827'
  },
  sheetCancelButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: NEUIKitColors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetCancelText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: '#111827'
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20
  },
  dropdownCard: {
    position: 'absolute',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#70757F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6
  },
  dropdownRow: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  dropdownRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEC'
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#222222'
  }
})
