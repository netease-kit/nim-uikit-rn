import React from 'react'
import {
  type DimensionValue,
  Linking,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  type TextProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import {
  EMOJI_ICON_MAP_CONFIG,
  EMOJI_RENDER_ICON_MAP_CONFIG
} from '@/src/NEUIKit/common/utils/emoji'
import { calculateMatrix } from '@/src/NEUIKit/common/utils/matrix'
import { parseText } from '@/src/NEUIKit/common/utils/parseText'
import { translateCurrentApp } from '@/utils/app-language'

import { UIKitUserAvatar } from './components'
import { UIKitSearchBar } from './contact-friend'
import { NEUIKitIconName, UIKitIcon } from './icon'

const EMOJI_VISIBLE_ROW_COUNT = 3
const EMOJI_ITEM_SIZE = 40
const EMOJI_ROW_GAP = 8
const EMOJI_GRID_MAX_HEIGHT =
  EMOJI_VISIBLE_ROW_COUNT * EMOJI_ITEM_SIZE + (EMOJI_VISIBLE_ROW_COUNT - 1) * EMOJI_ROW_GAP
const READ_RECEIPT_WRAP_SIZE = 22
const READ_RECEIPT_SECTOR_SIZE = 14
const READ_RECEIPT_ICON_SIZE = 18
const RICH_TEXT_LINE_HEIGHT = 24
const LATIN_WORD_PATTERN = /^[A-Za-z0-9_:/?#@!$&'()*+,;=.%~-]$/

function splitRichTextWrapUnits(value: string) {
  const units: string[] = []
  let latinRun = ''

  Array.from(value).forEach((char) => {
    if (LATIN_WORD_PATTERN.test(char)) {
      latinRun += char
      return
    }

    if (latinRun) {
      units.push(latinRun)
      latinRun = ''
    }

    units.push(char)
  })

  if (latinRun) {
    units.push(latinRun)
  }

  return units
}

export function UIKitChatHeaderTitle({
  title,
  subtitle,
  statusText
}: {
  title: string
  subtitle?: string
  statusText?: string
}) {
  return (
    <View style={styles.headerTitleWrap}>
      <View style={styles.headerTitleLine}>
        <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitleText}>
          {title}
        </ThemedText>
        {statusText ? (
          <ThemedText numberOfLines={1} style={styles.headerStatusText}>
            {`(${statusText})`}
          </ThemedText>
        ) : null}
      </View>
      {subtitle ? (
        <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.headerSubtitleText}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  )
}

export function UIKitSegmentTabs<T extends string>({
  items,
  activeKey,
  onChange,
  style
}: {
  items: { key: T; label: string }[]
  activeKey: T
  onChange: (key: T) => void
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.segmentTabs, style]}>
      {items.map((item) => {
        const active = item.key === activeKey

        return (
          <Pressable key={item.key} style={styles.segmentItem} onPress={() => onChange(item.key)}>
            <ThemedText style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {item.label}
            </ThemedText>
            <View style={[styles.segmentUnderline, active && styles.segmentUnderlineActive]} />
          </Pressable>
        )
      })}
    </View>
  )
}

export function UIKitChatSearchBar(props: React.ComponentProps<typeof UIKitSearchBar>) {
  return <UIKitSearchBar {...props} style={[styles.chatSearchBar, props.style]} />
}

export function UIKitChatEmptyState({
  title,
  description,
  actionLabel,
  onActionPress
}: {
  title: string
  description?: string
  actionLabel?: string
  onActionPress?: () => void
}) {
  return (
    <View style={styles.emptyState}>
      <ThemedText style={styles.emptyTitle}>{title}</ThemedText>
      {description ? <ThemedText style={styles.emptyDescription}>{description}</ThemedText> : null}
      {actionLabel && onActionPress ? (
        <TouchableOpacity style={styles.emptyAction} onPress={onActionPress}>
          <ThemedText style={styles.emptyActionText}>{actionLabel}</ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

export function UIKitChatMemberRow({
  account,
  title,
  subtitle,
  teamId
}: {
  account: string
  title: string
  subtitle?: string
  teamId?: string
}) {
  return (
    <View style={styles.memberRow}>
      <UIKitUserAvatar account={account} teamId={teamId} size={42} />
      <View style={styles.memberMeta}>
        <ThemedText numberOfLines={1} style={styles.memberTitle}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText numberOfLines={1} style={styles.memberSubtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </View>
  )
}

export function UIKitMessageCard({
  title,
  subtitle,
  preview,
  highlightedPreview,
  previewNumberOfLines,
  failed,
  footer,
  style,
  onPress
}: {
  title: string
  subtitle?: string
  preview: string
  highlightedPreview?: React.ReactNode
  previewNumberOfLines?: number | null
  failed?: boolean
  footer?: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}) {
  const resolvedPreviewNumberOfLines =
    previewNumberOfLines === null ? undefined : (previewNumberOfLines ?? 4)
  const content = (
    <View style={[styles.messageCard, style]}>
      <View style={styles.messageCardHeader}>
        <ThemedText numberOfLines={1} style={styles.messageCardTitle}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText numberOfLines={1} style={styles.messageCardSubtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <View style={styles.messageCardPreviewWrap}>
        {highlightedPreview ? (
          highlightedPreview
        ) : (
          <ThemedText
            numberOfLines={resolvedPreviewNumberOfLines}
            style={styles.messageCardPreview}
          >
            {preview}
          </ThemedText>
        )}
      </View>
      {failed ? (
        <View style={styles.failedBadge}>
          <ThemedText style={styles.failedBadgeText}>
            {translateCurrentApp('commonSendFailedLabel' as never)}
          </ThemedText>
        </View>
      ) : null}
      {footer}
    </View>
  )

  if (!onPress) {
    return content
  }

  return (
    <Pressable style={({ pressed }) => [pressed && styles.cardPressed]} onPress={onPress}>
      {content}
    </Pressable>
  )
}

export function UIKitActionPill({
  label,
  onPress,
  tone = 'default',
  style
}: {
  label: string
  onPress: () => void
  tone?: 'default' | 'primary' | 'danger'
  style?: StyleProp<ViewStyle>
}) {
  return (
    <TouchableOpacity
      style={[
        styles.actionPill,
        tone === 'primary' && styles.actionPillPrimary,
        tone === 'danger' && styles.actionPillDanger,
        style
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.actionPillText,
          tone === 'primary' && styles.actionPillPrimaryText,
          tone === 'danger' && styles.actionPillDangerText
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  )
}

export function UIKitSelectionIndicator({
  selected,
  style,
  textStyle
}: {
  selected: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}) {
  return (
    <View style={[styles.selectionIndicator, selected && styles.selectionIndicatorSelected, style]}>
      {selected ? (
        <ThemedText style={[styles.selectionIndicatorText, textStyle]}>✓</ThemedText>
      ) : null}
    </View>
  )
}

export function UIKitChatToolbarAction({
  icon,
  label,
  onPress,
  active = false,
  noTint = false,
  activeTintColor = '#337EFF',
  inactiveTintColor = '#A0A8B4',
  disabled = false,
  hideLabel = false,
  iconSize = 22,
  iconWrapSize = 40
}: {
  icon?: NEUIKitIconName
  label: string
  onPress: () => void
  active?: boolean
  noTint?: boolean
  activeTintColor?: string
  inactiveTintColor?: string
  disabled?: boolean
  hideLabel?: boolean
  iconSize?: number
  iconWrapSize?: number
}) {
  const muted = disabled || !active

  return (
    <TouchableOpacity
      style={[
        styles.toolbarAction,
        hideLabel && styles.toolbarActionIconOnly,
        muted && styles.toolbarActionDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.toolbarIconWrap, { width: iconWrapSize, height: iconWrapSize }]}>
        {icon ? (
          <UIKitIcon
            type={icon}
            width={iconSize}
            height={iconSize}
            tintColor={noTint ? undefined : active ? activeTintColor : inactiveTintColor}
            style={[styles.toolbarIcon, { width: iconSize, height: iconSize }]}
          />
        ) : (
          <ThemedText style={[styles.toolbarFallback, active && styles.toolbarFallbackActive]}>
            {label.slice(0, 1)}
          </ThemedText>
        )}
      </View>
      {hideLabel ? null : (
        <ThemedText style={[styles.toolbarLabel, muted && styles.toolbarLabelDisabled]}>
          {label}
        </ThemedText>
      )}
    </TouchableOpacity>
  )
}

export function UIKitChatComposerShell({
  placeholder,
  actions,
  style
}: {
  placeholder: string
  actions?: {
    key: string
    label: string
    icon?: NEUIKitIconName
    active?: boolean
    noTint?: boolean
    activeTintColor?: string
    inactiveTintColor?: string
    iconSize?: number
    iconWrapSize?: number
    onPress?: () => void
  }[]
  style?: StyleProp<ViewStyle>
}) {
  const toolbarActions = actions || [
    {
      key: 'voice',
      label: translateCurrentApp('toolbarVoice' as never),
      icon: 'toolbar-voice' as NEUIKitIconName,
      noTint: true
    },
    {
      key: 'emoji',
      label: translateCurrentApp('toolbarEmoji' as never),
      icon: 'icon-biaoqing' as NEUIKitIconName
    },
    {
      key: 'image',
      label: translateCurrentApp('albumText' as never),
      icon: 'icon-tupian' as NEUIKitIconName
    },
    {
      key: 'collect',
      label: translateCurrentApp('collectionText' as never),
      icon: 'icon-collection' as NEUIKitIconName,
      noTint: true
    },
    {
      key: 'more',
      label: translateCurrentApp('toolbarMore' as never),
      icon: 'icon-tianjiaanniu' as NEUIKitIconName
    }
  ]

  return (
    <View style={[styles.composerShell, style]}>
      <View style={styles.composerInput}>
        <ThemedText numberOfLines={1} style={styles.composerPlaceholder}>
          {placeholder}
        </ThemedText>
      </View>
      <View style={styles.composerToolbar}>
        {toolbarActions.map((item) => (
          <UIKitChatToolbarAction
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={item.active}
            noTint={item.noTint}
            activeTintColor={item.activeTintColor}
            inactiveTintColor={item.inactiveTintColor}
            iconSize={item.iconSize}
            iconWrapSize={item.iconWrapSize}
            onPress={item.onPress || (() => undefined)}
          />
        ))}
      </View>
    </View>
  )
}

export function UIKitChatActionGrid({
  columns,
  items
}: {
  columns?: number
  items: {
    key: string
    label: string
    icon?: NEUIKitIconName
    danger?: boolean
    onPress: () => void
  }[]
}) {
  const columnCount = Math.max(1, columns || items.length || 1)
  const itemWidth = `${100 / columnCount}%` as DimensionValue

  return (
    <View style={styles.actionGrid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.actionGridItem, { width: itemWidth }]}
          onPress={item.onPress}
        >
          <View style={styles.actionGridIconWrap}>
            {item.icon ? (
              <UIKitIcon
                type={item.icon}
                size={22}
                tintColor={item.danger ? '#FF6C63' : '#5F6775'}
              />
            ) : (
              <ThemedText
                style={[styles.actionGridFallback, item.danger && styles.actionGridFallbackDanger]}
              >
                {item.label.slice(0, 1)}
              </ThemedText>
            )}
          </View>
          <ThemedText style={[styles.actionGridLabel, item.danger && styles.actionGridLabelDanger]}>
            {item.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export function UIKitEmojiPanel({
  onEmojiPress,
  onDeletePress,
  onSendPress,
  bottomInset = 0,
  style
}: {
  onEmojiPress: (emoji: { key: string; type: string }) => void
  onDeletePress: () => void
  onSendPress: () => void
  bottomInset?: number
  style?: StyleProp<ViewStyle>
}) {
  const emojiEntries = React.useMemo(
    () => Object.entries(EMOJI_ICON_MAP_CONFIG) as [string, NEUIKitIconName][],
    []
  )
  const emojiMatrix = React.useMemo(() => calculateMatrix(emojiEntries, 7), [emojiEntries])
  const lastRowIndex = emojiMatrix.length - 1

  return (
    <View style={[styles.emojiPanel, style]}>
      <View style={styles.emojiGridCard}>
        <ScrollView
          style={styles.emojiGridViewport}
          contentContainerStyle={styles.emojiGrid}
          showsVerticalScrollIndicator={false}
        >
          {emojiMatrix.map((emojiRow, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.emojiRow}>
              {emojiRow.map(([key, type]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.emojiItem}
                  onPress={() => onEmojiPress({ key, type })}
                >
                  <UIKitIcon type={type} size={30} />
                </TouchableOpacity>
              ))}
              {rowIndex === lastRowIndex ? (
                <TouchableOpacity style={styles.emojiDeleteInlineButton} onPress={onDeletePress}>
                  <UIKitIcon type="icon-tuigejian" size={24} tintColor="#98A1AD" />
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </View>
      <View
        style={[styles.emojiPanelFooter, bottomInset > 0 ? { paddingBottom: bottomInset } : null]}
      >
        <View style={styles.emojiFooterSpacer} />
        <TouchableOpacity style={styles.emojiSendButton} onPress={onSendPress}>
          <ThemedText style={styles.emojiSendButtonText}>
            {translateCurrentApp('sendText' as never)}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export function UIKitMessageReadIndicator({
  progress,
  label,
  onPress,
  style
}: {
  progress: number
  label?: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}) {
  const normalizedProgress = Math.max(0, Math.min(progress, 1))
  const rotateDeg = normalizedProgress * 360
  const fullyRead = normalizedProgress >= 1
  const content = fullyRead ? (
    <View style={styles.messageReadIconWrap}>
      <UIKitIcon type="icon-read" size={READ_RECEIPT_ICON_SIZE} />
    </View>
  ) : (
    <View style={styles.messageReadSector}>
      <View
        style={[styles.messageReadCoverPrimary, { transform: [{ rotate: `${rotateDeg}deg` }] }]}
      />
      <View
        style={[
          styles.messageReadCoverSecondary,
          rotateDeg >= 180 && styles.messageReadCoverSecondaryFilled
        ]}
      />
    </View>
  )

  if (!onPress) {
    return (
      <View style={[styles.messageReadWrap, style]}>
        {content}
        {label ? <ThemedText style={styles.messageReadLabel}>{label}</ThemedText> : null}
      </View>
    )
  }

  return (
    <Pressable style={[styles.messageReadWrap, style]} onPress={onPress}>
      {content}
      {label ? <ThemedText style={styles.messageReadLabel}>{label}</ThemedText> : null}
    </Pressable>
  )
}

export function UIKitChatRichText({
  text,
  ext,
  textStyle,
  mentionStyle,
  linkStyle,
  onPressLink,
  onLongPressLink,
  emojiSize = 24,
  containerStyle,
  numberOfLines,
  ellipsizeMode,
  lineHeight = RICH_TEXT_LINE_HEIGHT
}: {
  text: string
  ext?: string
  textStyle?: StyleProp<TextStyle>
  mentionStyle?: StyleProp<TextStyle>
  linkStyle?: StyleProp<TextStyle>
  onPressLink?: (url: string) => void
  onLongPressLink?: () => void
  emojiSize?: number
  containerStyle?: StyleProp<ViewStyle>
  numberOfLines?: number
  ellipsizeMode?: TextProps['ellipsizeMode']
  lineHeight?: number
}) {
  const parts = React.useMemo(() => {
    try {
      return parseText(text, ext)
    } catch {
      return [{ type: 'text' as const, value: text, key: 'text-0' }]
    }
  }, [ext, text])
  const hasRenderedEmoji = parts.some(
    (item) => item.type === 'emoji' && !!EMOJI_RENDER_ICON_MAP_CONFIG[item.value]
  )

  if (!hasRenderedEmoji) {
    return (
      <ThemedText
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        style={[
          styles.richTextBase,
          { height: lineHeight, lineHeight },
          styles.richTextInline,
          textStyle
        ]}
      >
        {parts.map((item) => {
          if (item.type === 'Ait') {
            return (
              <ThemedText
                key={item.key}
                style={[styles.richTextBase, textStyle, styles.richMention, mentionStyle]}
              >
                {item.value}
              </ThemedText>
            )
          }

          if (item.type === 'link') {
            return (
              <ThemedText
                key={item.key}
                style={[styles.richTextBase, textStyle, styles.richLink, linkStyle]}
                onPress={() => {
                  if (onPressLink) {
                    onPressLink(item.value)
                    return
                  }

                  Linking.openURL(item.value).catch(() => undefined)
                }}
                onLongPress={onLongPressLink}
              >
                {item.value}
              </ThemedText>
            )
          }

          return item.value
        })}
      </ThemedText>
    )
  }

  return (
    <View
      style={[
        styles.richTextWrap,
        numberOfLines ? styles.richTextClippedWrap : null,
        numberOfLines ? { maxHeight: lineHeight * numberOfLines } : null,
        containerStyle
      ]}
    >
      {parts.map((item) => {
        if (item.type === 'emoji') {
          const type = EMOJI_RENDER_ICON_MAP_CONFIG[item.value] as NEUIKitIconName | undefined

          if (!type) {
            return splitRichTextWrapUnits(item.value).map((unit, index) => (
              <ThemedText
                key={`${item.key}-${index}`}
                style={[styles.richTextBase, { height: lineHeight, lineHeight }, textStyle]}
              >
                {unit}
              </ThemedText>
            ))
          }

          return (
            <View key={item.key} style={[styles.richEmojiWrap, { height: lineHeight }]}>
              <UIKitIcon type={type} size={emojiSize} />
            </View>
          )
        }

        if (item.type === 'Ait') {
          return splitRichTextWrapUnits(item.value).map((unit, index) => (
            <ThemedText
              key={`${item.key}-${index}`}
              style={[
                styles.richTextBase,
                { height: lineHeight, lineHeight },
                textStyle,
                styles.richMention,
                mentionStyle
              ]}
            >
              {unit}
            </ThemedText>
          ))
        }

        if (item.type === 'link') {
          return splitRichTextWrapUnits(item.value).map((unit, index) => (
            <ThemedText
              key={`${item.key}-${index}`}
              style={[
                styles.richTextBase,
                { height: lineHeight, lineHeight },
                textStyle,
                styles.richLink,
                linkStyle
              ]}
              onPress={() => {
                if (onPressLink) {
                  onPressLink(item.value)
                  return
                }

                Linking.openURL(item.value).catch(() => undefined)
              }}
              onLongPress={onLongPressLink}
            >
              {unit}
            </ThemedText>
          ))
        }

        return splitRichTextWrapUnits(item.value).map((unit, index) => (
          <ThemedText
            key={`${item.key}-${index}`}
            style={[styles.richTextBase, { height: lineHeight, lineHeight }, textStyle]}
          >
            {unit}
          </ThemedText>
        ))
      })}
    </View>
  )
}

export function UIKitChatHighlightText({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim()) {
    return <ThemedText style={styles.messageCardPreview}>{text}</ThemedText>
  }

  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  const parts: { text: string; highlighted: boolean }[] = []
  let cursor = 0

  while (cursor < text.length) {
    const hit = lowerText.indexOf(lowerKeyword, cursor)

    if (hit < 0) {
      parts.push({ text: text.slice(cursor), highlighted: false })
      break
    }

    if (hit > cursor) {
      parts.push({ text: text.slice(cursor, hit), highlighted: false })
    }

    parts.push({
      text: text.slice(hit, hit + keyword.length),
      highlighted: true
    })
    cursor = hit + keyword.length
  }

  return (
    <ThemedText style={styles.messageCardPreview}>
      {parts.map((part, index) => (
        <ThemedText
          key={`${part.text}-${index}`}
          style={part.highlighted ? styles.highlightText : styles.messageCardPreview}
        >
          {part.text}
        </ThemedText>
      ))}
    </ThemedText>
  )
}

const styles = StyleSheet.create({
  headerTitleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 220,
    flexShrink: 1
  },
  headerTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    minWidth: 0
  },
  headerTitleText: {
    color: '#1E2633',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'center'
  },
  headerStatusText: {
    marginLeft: 4,
    color: '#1E2633',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    flexShrink: 0
  },
  headerSubtitleText: {
    marginTop: 1,
    color: '#97A2B3',
    fontSize: 11,
    lineHeight: 15,
    width: '100%',
    textAlign: 'center'
  },
  segmentTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF'
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 0
  },
  segmentLabel: {
    color: '#939CAB',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500'
  },
  segmentLabelActive: {
    color: '#1F2734',
    fontWeight: '700'
  },
  segmentUnderline: {
    width: 26,
    height: 3,
    borderRadius: 999,
    marginTop: 9,
    backgroundColor: 'transparent'
  },
  segmentUnderlineActive: {
    backgroundColor: '#337EFF'
  },
  chatSearchBar: {
    minHeight: 42,
    borderRadius: 16,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 14
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 56
  },
  emptyTitle: {
    color: '#333B48',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600'
  },
  emptyDescription: {
    marginTop: 8,
    textAlign: 'center',
    color: '#9AA4B2',
    fontSize: 13,
    lineHeight: 20
  },
  emptyAction: {
    minHeight: 38,
    minWidth: 88,
    borderRadius: 19,
    backgroundColor: '#337EFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 18
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF'
  },
  memberMeta: {
    flex: 1,
    gap: 2
  },
  memberTitle: {
    color: '#293241',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600'
  },
  memberSubtitle: {
    color: '#96A0AF',
    fontSize: 12,
    lineHeight: 18
  },
  messageCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 14,
    gap: 10
  },
  cardPressed: {
    opacity: 0.92
  },
  messageCardHeader: {
    gap: 4
  },
  messageCardTitle: {
    color: '#2A313F',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700'
  },
  messageCardSubtitle: {
    color: '#9AA3B0',
    fontSize: 12,
    lineHeight: 18
  },
  messageCardPreviewWrap: {
    gap: 2
  },
  messageCardPreview: {
    color: '#566071',
    fontSize: 14,
    lineHeight: 21
  },
  highlightText: {
    color: '#337EFF',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600'
  },
  failedBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#FFF0EE',
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  failedBadgeText: {
    color: '#FF6C63',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700'
  },
  actionPill: {
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: '#EFF3F8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  actionPillPrimary: {
    backgroundColor: '#337EFF'
  },
  actionPillDanger: {
    backgroundColor: '#FFF1EF'
  },
  actionPillText: {
    color: '#465060',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700'
  },
  actionPillPrimaryText: {
    color: '#FFFFFF'
  },
  actionPillDangerText: {
    color: '#FF6C63'
  },
  selectionIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#C3CCD8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectionIndicatorSelected: {
    backgroundColor: '#337EFF',
    borderColor: '#337EFF'
  },
  selectionIndicatorText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  toolbarAction: {
    width: 58,
    alignItems: 'center',
    gap: 6
  },
  toolbarActionIconOnly: {
    width: 40,
    gap: 0
  },
  toolbarActionDisabled: {
    opacity: 0.55
  },
  toolbarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  toolbarIcon: {
    width: 22,
    height: 22
  },
  toolbarFallback: {
    color: '#4C5564',
    fontSize: 15,
    fontWeight: '700'
  },
  toolbarFallbackActive: {
    color: '#FFFFFF'
  },
  toolbarLabel: {
    color: '#7A8494',
    fontSize: 11,
    lineHeight: 16
  },
  toolbarLabelDisabled: {
    color: '#A0A8B4'
  },
  composerShell: {
    backgroundColor: '#EEF2F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D9E1EC',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 14
  },
  composerInput: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  composerPlaceholder: {
    color: '#C0C8D3',
    fontSize: 18,
    lineHeight: 25
  },
  composerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8
  },
  actionGridItem: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6
  },
  actionGridIconWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionGridFallback: {
    color: '#5F6775',
    fontWeight: '700'
  },
  actionGridFallbackDanger: {
    color: '#FF6C63'
  },
  actionGridLabel: {
    color: '#596272',
    fontSize: 10,
    lineHeight: 14
  },
  actionGridLabelDanger: {
    color: '#FF6C63'
  },
  emojiPanel: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D8E0EA',
    backgroundColor: '#F5F7FB'
  },
  emojiGridCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 8
  },
  emojiGridViewport: {
    maxHeight: EMOJI_GRID_MAX_HEIGHT
  },
  emojiGrid: {
    gap: 8
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  emojiItem: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emojiDeleteInlineButton: {
    width: 46,
    height: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D9E1EC',
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emojiPanelFooter: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6EBF2'
  },
  emojiFooterSpacer: {
    flex: 1,
    minHeight: 46
  },
  emojiSendButton: {
    width: 92,
    minHeight: 46,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emojiSendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700'
  },
  messageReadWrap: {
    minHeight: READ_RECEIPT_WRAP_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  messageReadLabel: {
    marginLeft: 4,
    color: '#98A1AD',
    fontSize: 12,
    lineHeight: 16
  },
  messageReadIconWrap: {
    width: READ_RECEIPT_ICON_SIZE,
    height: READ_RECEIPT_ICON_SIZE,
    marginRight: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageReadSector: {
    width: READ_RECEIPT_SECTOR_SIZE,
    height: READ_RECEIPT_SECTOR_SIZE,
    marginRight: 3,
    borderRadius: READ_RECEIPT_SECTOR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#4C84FF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  messageReadCoverPrimary: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    backgroundColor: '#4C84FF',
    transformOrigin: 'right center'
  },
  messageReadCoverSecondary: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: '100%',
    backgroundColor: '#FFFFFF'
  },
  messageReadCoverSecondaryFilled: {
    right: 0,
    backgroundColor: '#4C84FF'
  },
  richTextWrap: {
    maxWidth: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flexShrink: 1
  },
  richTextClippedWrap: {
    overflow: 'hidden'
  },
  richTextBase: {
    fontSize: 16,
    lineHeight: RICH_TEXT_LINE_HEIGHT,
    height: RICH_TEXT_LINE_HEIGHT,
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  richTextInline: {
    maxWidth: '100%',
    height: undefined,
    flexShrink: 1
  },
  richMention: {
    color: '#1861DF'
  },
  richLink: {
    color: '#1861DF'
  },
  richEmojiWrap: {
    width: 24,
    height: 24,
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
