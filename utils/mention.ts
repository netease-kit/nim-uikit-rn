import { V2NIMConversationType, V2NIMMessage } from '@/utils/nim-sdk'

export const AT_ALL_ACCOUNT = 'ait_all'

export type MentionSegment = {
  start: number
  end: number
  broken?: boolean
}

export type MentionBlock = {
  text: string
  accountId?: string
  segments: MentionSegment[]
}

export type MentionDraft = Record<string, MentionBlock>

export type MentionInsertResult = {
  text: string
  selection: { start: number; end: number }
  mentions: MentionDraft
}

export type MentionTextDiff = {
  start: number
  previousEnd: number
  nextEnd: number
  removedText: string
  insertedText: string
}

function cloneMentionDraft(mentions: MentionDraft): MentionDraft {
  return Object.fromEntries(
    Object.entries(mentions).map(([accountId, block]) => [
      accountId,
      {
        ...block,
        segments: block.segments.map((segment) => ({ ...segment }))
      }
    ])
  )
}

function isValidBlock(block: MentionBlock) {
  return block.segments.some((segment) => !segment.broken)
}

function pruneMentionDraft(mentions: MentionDraft): MentionDraft {
  return Object.fromEntries(Object.entries(mentions).filter(([, block]) => isValidBlock(block)))
}

function normalizeMentionSegmentForText(
  text: string,
  block: MentionBlock,
  segment: MentionSegment
) {
  if (segment.broken) {
    return null
  }

  const visibleText = text.slice(segment.start, segment.end + 1)

  if (visibleText === block.text) {
    return { text: visibleText, segment }
  }

  const trimmedBlockText = block.text.trimEnd()
  const trailingVisibleText = text.slice(segment.start)

  if (
    segment.end >= text.length &&
    trailingVisibleText === trimmedBlockText &&
    trailingVisibleText.length > 0
  ) {
    return {
      text: trailingVisibleText,
      segment: {
        ...segment,
        end: segment.start + trailingVisibleText.length - 1
      }
    }
  }

  return null
}

export function parseMentionExtension(serverExtension?: string | null): MentionDraft {
  if (!serverExtension) {
    return {}
  }

  try {
    const parsed = JSON.parse(serverExtension) as { yxAitMsg?: MentionDraft }
    return parsed.yxAitMsg || {}
  } catch {
    return {}
  }
}

export function hasMentionForAccount(message: V2NIMMessage, accountId?: string | null) {
  if (
    !accountId ||
    message.conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ||
    message.senderId === accountId
  ) {
    return false
  }

  const mentions = parseMentionExtension(message.serverExtension)
  return Object.keys(mentions).some((key) => key === accountId || key === AT_ALL_ACCOUNT)
}

export function buildMentionExtension(
  text: string,
  mentions: MentionDraft,
  existingExtension?: string | null
) {
  const validMentions = pruneMentionDraft(
    Object.fromEntries(
      Object.entries(mentions)
        .map(([accountId, block]) => {
          const normalizedSegments = block.segments
            .map((segment) => normalizeMentionSegmentForText(text, block, segment))
            .filter(
              (result): result is { text: string; segment: MentionSegment } => result !== null
            )
          const normalizedText = normalizedSegments[0]?.text || block.text

          return [
            accountId,
            {
              ...block,
              text: normalizedText,
              accountId,
              segments: normalizedSegments.map((result) => result.segment)
            }
          ]
        })
        .filter(([, block]) => (block as MentionBlock).segments.length > 0)
    )
  )

  let extension: Record<string, unknown> = {}

  if (existingExtension) {
    try {
      extension = JSON.parse(existingExtension) as Record<string, unknown>
    } catch {
      extension = {}
    }
  }

  if (Object.keys(validMentions).length === 0) {
    delete extension.yxAitMsg
  } else {
    extension.yxAitMsg = validMentions
  }

  return Object.keys(extension).length > 0 ? JSON.stringify(extension) : undefined
}

export function getMentionPushInfo(text: string, mentions: MentionDraft) {
  const accountIds = Object.keys(mentions)

  if (accountIds.length === 0) {
    return null
  }

  return {
    forcePush: true,
    forcePushContent: text,
    forcePushAccountIds: accountIds.includes(AT_ALL_ACCOUNT) ? undefined : accountIds
  }
}

export function shiftMentionsForInsert(
  mentions: MentionDraft,
  start: number,
  insertedText: string
) {
  const nextMentions = cloneMentionDraft(mentions)
  const length = insertedText.length

  Object.values(nextMentions).forEach((block) => {
    block.segments.forEach((segment) => {
      if (start > segment.start && start <= segment.end) {
        segment.end += length
        segment.broken = true
      } else if (start <= segment.start) {
        segment.start += length
        segment.end += length
      }
    })
  })

  return pruneMentionDraft(nextMentions)
}

export function shiftMentionsForDelete(mentions: MentionDraft, start: number, length: number) {
  const nextMentions = cloneMentionDraft(mentions)
  const after = start - length

  Object.values(nextMentions).forEach((block) => {
    block.segments = block.segments
      .map((segment) => {
        if (start > segment.start) {
          if (after <= segment.start) {
            return null
          }

          if (after <= segment.end) {
            return {
              ...segment,
              end: segment.end - length,
              broken: true
            }
          }

          return segment
        }

        return {
          ...segment,
          start: segment.start - length,
          end: segment.end - length
        }
      })
      .filter((segment): segment is MentionSegment => !!segment)
  })

  return pruneMentionDraft(nextMentions)
}

export function findMentionEndingAt(mentions: MentionDraft, endExclusive: number) {
  const end = endExclusive - 1

  for (const block of Object.values(mentions)) {
    const segment = block.segments.find((item) => !item.broken && item.end === end)

    if (segment) {
      return segment
    }
  }

  return null
}

export function applyMentionTextChange(
  previousText: string,
  nextText: string,
  mentions: MentionDraft,
  _selectionStart: number
) {
  const diff = getMentionTextDiff(previousText, nextText)
  const removedLength = diff.removedText.length
  const insertedLength = diff.insertedText.length

  if (removedLength === 0 && insertedLength === 0) {
    return {
      text: nextText,
      mentions
    }
  }

  if (removedLength > 0 && insertedLength === 0) {
    const deleteStart = diff.previousEnd
    const deletingMention = removedLength === 1 ? findMentionEndingAt(mentions, deleteStart) : null

    if (deletingMention) {
      const tokenLength = deleteStart - deletingMention.start
      const updatedText =
        previousText.slice(0, deletingMention.start) + previousText.slice(deleteStart)

      return {
        text: updatedText,
        mentions: shiftMentionsForDelete(mentions, deleteStart, tokenLength)
      }
    }

    return {
      text: nextText,
      mentions: shiftMentionsForDelete(mentions, deleteStart, removedLength)
    }
  }

  if (insertedLength > 0 && removedLength === 0) {
    return {
      text: nextText,
      mentions: shiftMentionsForInsert(mentions, diff.start, diff.insertedText)
    }
  }

  const shiftedAfterDelete = shiftMentionsForDelete(mentions, diff.previousEnd, removedLength)
  const shiftedAfterInsert =
    insertedLength > 0
      ? shiftMentionsForInsert(shiftedAfterDelete, diff.start, diff.insertedText)
      : shiftedAfterDelete

  return {
    text: nextText,
    mentions: shiftedAfterInsert
  }
}

export function getMentionTextDiff(previousText: string, nextText: string): MentionTextDiff {
  let start = 0

  while (
    start < previousText.length &&
    start < nextText.length &&
    previousText[start] === nextText[start]
  ) {
    start += 1
  }

  let previousEnd = previousText.length
  let nextEnd = nextText.length

  while (
    previousEnd > start &&
    nextEnd > start &&
    previousText[previousEnd - 1] === nextText[nextEnd - 1]
  ) {
    previousEnd -= 1
    nextEnd -= 1
  }

  return {
    start,
    previousEnd,
    nextEnd,
    removedText: previousText.slice(start, previousEnd),
    insertedText: nextText.slice(start, nextEnd)
  }
}

export function findMentionTriggerSelectionStart(previousText: string, nextText: string) {
  const diff = getMentionTextDiff(previousText, nextText)

  if (diff.insertedText !== '@') {
    return null
  }

  return diff.nextEnd
}

export function insertMentionToken(
  text: string,
  mentions: MentionDraft,
  accountId: string,
  displayName: string,
  selectionStart: number,
  replaceAt = false
): MentionInsertResult {
  const token = `@${displayName.trim() || accountId} `
  const safeSelectionStart = Math.max(0, Math.min(selectionStart, text.length))
  const replaceStart =
    replaceAt && safeSelectionStart > 0 && text[safeSelectionStart - 1] === '@'
      ? safeSelectionStart - 1
      : safeSelectionStart
  const replaceEnd = safeSelectionStart
  const removedLength = replaceEnd - replaceStart
  const shiftedAfterDelete =
    removedLength > 0 ? shiftMentionsForDelete(mentions, replaceEnd, removedLength) : mentions
  const shiftedAfterInsert = shiftMentionsForInsert(shiftedAfterDelete, replaceStart, token)
  const nextText = text.slice(0, replaceStart) + token + text.slice(replaceEnd)
  const block = shiftedAfterInsert[accountId] || {
    text: token,
    accountId,
    segments: []
  }

  block.text = token
  block.accountId = accountId
  block.segments = [
    ...block.segments,
    {
      start: replaceStart,
      end: replaceStart + token.length - 1
    }
  ]

  return {
    text: nextText,
    selection: {
      start: replaceStart + token.length,
      end: replaceStart + token.length
    },
    mentions: pruneMentionDraft({
      ...shiftedAfterInsert,
      [accountId]: block
    })
  }
}
