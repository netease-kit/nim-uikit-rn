import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { UIKitInfoRow, UIKitPage, UIKitRowDivider, UIKitUserAvatar } from '@/src/NEUIKit/rn'
import { getTeamCategory, TEAM_CATEGORY, teamStore } from '@/stores'
import { nimStore } from '@/stores/NIMStore'
import { V2NIMTeamMemberRole, V2NIMTeamUpdateInfoMode } from '@/utils/nim-sdk'

const TeamInfoScreen = observer(() => {
  const { t } = useAppTranslation()
  const { runWithNavigationLock } = useNavigationLock()
  const { teamId } = useLocalSearchParams<{ teamId?: string }>()
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const team = teamStore.getTeam(resolvedTeamId)
  const currentAccountId = nimStore.getLoginUser()
  const member = teamStore
    .getMembers(resolvedTeamId)
    .find((item) => item.accountId === currentAccountId)
  const isDiscussion = getTeamCategory(team) === TEAM_CATEGORY.DISCUSSION
  const canEditTeamInfo =
    team?.updateInfoMode === V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL ||
    member?.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER ||
    member?.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
  const copy = {
    avatarLabel: isDiscussion ? t('teamSettingsDiscussionAvatar') : t('teamSettingsAvatar'),
    nameLabel: isDiscussion ? t('teamSettingsDiscussionName') : t('teamSettingsName'),
    title: isDiscussion ? t('teamDiscussionInfoTitle') : t('teamInfoTitle')
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: copy.title, headerTitleAlign: 'center' }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <UIKitInfoRow
            label={copy.avatarLabel}
            value=""
            showChevron={canEditTeamInfo}
            right={
              <UIKitUserAvatar
                account={resolvedTeamId || team?.name || t('commonGroupChat')}
                avatar={team?.avatar}
                size={38}
              />
            }
            onPress={
              canEditTeamInfo
                ? () =>
                    runWithNavigationLock(() => {
                      router.push({
                        pathname: '/team/edit',
                        params: {
                          teamId: resolvedTeamId,
                          field: 'avatar',
                          title: copy.avatarLabel
                        }
                      } as never)
                    })
                : undefined
            }
          />
          <UIKitRowDivider />
          <UIKitInfoRow
            label={copy.nameLabel}
            value={team?.name || t('commonNotSet')}
            valueNumberOfLines={1}
            showChevron
            onPress={() =>
              runWithNavigationLock(() => {
                router.push({
                  pathname: '/team/edit',
                  params: {
                    teamId: resolvedTeamId,
                    field: 'name',
                    title: copy.nameLabel
                  }
                } as never)
              })
            }
          />
          {!isDiscussion ? (
            <>
              <UIKitRowDivider />
              <UIKitInfoRow
                label={t('teamSettingsIntro')}
                value={team?.intro || t('commonNotSet')}
                valueNumberOfLines={1}
                showChevron
                onPress={() =>
                  runWithNavigationLock(() => {
                    router.push({
                      pathname: '/team/edit',
                      params: {
                        teamId: resolvedTeamId,
                        field: 'intro',
                        title: t('teamSettingsIntro')
                      }
                    } as never)
                  })
                }
              />
            </>
          ) : null}
        </View>
      </ScrollView>
    </UIKitPage>
  )
})

const styles = StyleSheet.create({
  page: {
    flex: 1
  },
  content: {
    padding: 16
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  }
})

export default TeamInfoScreen
