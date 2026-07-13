import React from 'react'
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Switch,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'

import { UIKitTextInput, UIKitUserAvatar } from './components'
import { UIKitIcon } from './icon'
import { NEUIKitColors } from './theme'

export function UIKitSearchBar({
  value,
  onChangeText,
  placeholder,
  autoFocus,
  returnKeyType = 'search',
  onSubmitEditing,
  style
}: {
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  autoFocus?: boolean
  returnKeyType?: TextInputProps['returnKeyType']
  onSubmitEditing?: TextInputProps['onSubmitEditing']
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.searchBar, style]}>
      <UIKitIcon type="icon-sousuo" size={24} tintColor="#A8B1BF" />
      <UIKitTextInput
        autoFocus={autoFocus}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        style={styles.searchInput}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={10}>
          <View style={styles.clearChip}>
            <ThemedText style={styles.clearChipText}>x</ThemedText>
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

export function UIKitSectionLabel({
  label,
  style
}: {
  label: string
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.sectionLabelWrap, style]}>
      <ThemedText style={styles.sectionLabelText}>{label}</ThemedText>
    </View>
  )
}

export function UIKitOutlineButton({
  label,
  onPress,
  tintColor = NEUIKitColors.primary,
  style,
  textStyle,
  disabled
}: {
  label: string
  onPress: () => void
  tintColor?: string
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  disabled?: boolean
}) {
  return (
    <TouchableOpacity
      style={[
        styles.outlineButton,
        { borderColor: disabled ? '#D4D9E1' : tintColor },
        disabled && styles.outlineButtonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedText
        style={[styles.outlineButtonText, { color: disabled ? '#B5BCC7' : tintColor }, textStyle]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  )
}

export function UIKitProfileHero({
  account,
  avatar,
  title,
  lines
}: {
  account: string
  avatar?: string
  title: string
  lines: string[]
}) {
  return (
    <View style={styles.profileHero}>
      <UIKitUserAvatar account={account} avatar={avatar} size={60} />
      <View style={styles.profileTextWrap}>
        <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.profileTitle}>
          {title}
        </ThemedText>
        {lines.filter(Boolean).map((line) => (
          <ThemedText key={line} numberOfLines={1} ellipsizeMode="tail" style={styles.profileLine}>
            {line}
          </ThemedText>
        ))}
      </View>
    </View>
  )
}

export function UIKitInfoRow({
  label,
  value,
  onPress,
  showChevron = false,
  right,
  style,
  valueNumberOfLines = 2,
  compact = false
}: {
  label: string
  value?: string
  onPress?: () => void
  showChevron?: boolean
  right?: React.ReactNode
  style?: StyleProp<ViewStyle>
  valueNumberOfLines?: number
  compact?: boolean
}) {
  const content = (
    <View style={[styles.infoRow, compact && styles.infoRowCompact, style]}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <View style={[styles.infoRight, compact && styles.infoRightCompact]}>
        {right ? (
          right
        ) : value ? (
          <ThemedText numberOfLines={valueNumberOfLines} style={styles.infoValue}>
            {value}
          </ThemedText>
        ) : null}
        {showChevron ? <UIKitIcon type="icon-jiantou" size={18} tintColor="#A2AAB5" /> : null}
      </View>
    </View>
  )

  if (!onPress) {
    return content
  }

  return <Pressable onPress={onPress}>{content}</Pressable>
}

export function UIKitSwitchRow({
  label,
  value,
  onValueChange
}: {
  label: string
  value: boolean
  onValueChange: (value: boolean) => void
}) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <View style={styles.switchControl}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#DDE3EC', true: '#337EFF' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#DDE3EC"
        />
      </View>
    </View>
  )
}

export function UIKitActionCell({
  label,
  onPress,
  tone = 'primary'
}: {
  label: string
  onPress: () => void
  tone?: 'primary' | 'danger' | 'default'
}) {
  return (
    <TouchableOpacity style={styles.actionCell} onPress={onPress}>
      <ThemedText
        style={[
          styles.actionCellText,
          tone === 'primary' && styles.actionPrimaryText,
          tone === 'danger' && styles.actionDangerText
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  )
}

export function UIKitRowDivider() {
  return <View style={styles.rowDivider} />
}

const styles = StyleSheet.create({
  searchBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F0F3F7',
    paddingHorizontal: 18,
    gap: 10
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 17,
    color: '#333333',
    paddingVertical: 0
  },
  clearChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#B7BDC7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700'
  },
  sectionLabelWrap: {
    justifyContent: 'center',
    minHeight: 34
  },
  sectionLabelText: {
    color: '#B3BAC5',
    fontSize: 17,
    lineHeight: 24
  },
  outlineButton: {
    minWidth: 86,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  outlineButtonDisabled: {
    backgroundColor: '#F7F8FB'
  },
  outlineButtonText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500'
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF'
  },
  profileTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  profileTitle: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700'
  },
  profileLine: {
    color: '#7B8594',
    fontSize: 14,
    lineHeight: 20
  },
  infoRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF'
  },
  infoRowCompact: {
    minHeight: 56,
    paddingHorizontal: 20
  },
  infoLabel: {
    flexShrink: 0,
    color: '#333333',
    fontSize: 17,
    lineHeight: 24
  },
  infoRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginLeft: 20,
    minWidth: 0
  },
  infoRightCompact: {
    gap: 8,
    marginLeft: 16
  },
  switchControl: {
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoValue: {
    flexShrink: 1,
    color: '#A6AFBB',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'right'
  },
  actionCell: {
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  actionCellText: {
    fontSize: 17,
    lineHeight: 24,
    color: '#333333'
  },
  actionPrimaryText: {
    color: '#337EFF'
  },
  actionDangerText: {
    color: '#EE6867'
  },
  rowDivider: {
    height: 1,
    marginLeft: 20,
    backgroundColor: '#EEF2F7'
  }
})
