import { Stack, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { UIKitChatHeaderTitle } from '@/src/NEUIKit/rn'

const REPORT_TYPES = ['违法违规', '色情低俗', '广告营销', '诈骗诱导', '其他']

export default function ChatReportScreen() {
  const { reason } = useLocalSearchParams<{ reason?: string }>()
  const resolvedReason =
    typeof reason === 'string' ? reason : '内容可能涉及敏感信息，请调整后发送。'
  const [selectedType, setSelectedType] = useState(REPORT_TYPES[0])
  const [detail, setDetail] = useState('')

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title="举报" subtitle="消息异常" />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningCard}>
          <View style={styles.warningBadge}>
            <ThemedText style={styles.warningBadgeText}>风险提示</ThemedText>
          </View>
          <ThemedText style={styles.warningTitle}>消息发送异常</ThemedText>
          <ThemedText style={styles.warningText}>{resolvedReason}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>举报类型</ThemedText>
          <View style={styles.tagWrap}>
            {REPORT_TYPES.map((item) => {
              const selected = item === selectedType

              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.tag, selected && styles.tagSelected]}
                  onPress={() => setSelectedType(item)}
                >
                  <ThemedText style={[styles.tagText, selected && styles.tagTextSelected]}>
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>补充说明</ThemedText>
          <TextInput
            style={styles.textarea}
            value={detail}
            onChangeText={setDetail}
            multiline
            placeholder="请填写举报详情，便于后续接入真实举报服务。"
            placeholderTextColor="#B2BAC6"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => Alert.alert('已提交', '当前为视觉对齐壳层，后续可接入真实举报服务。')}
        >
          <ThemedText style={styles.submitText}>提交举报</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB'
  },
  content: {
    padding: 20,
    paddingBottom: 28,
    gap: 18
  },
  warningCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 10
  },
  warningBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#FFF1E8',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  warningBadgeText: {
    color: '#E36B2C',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700'
  },
  warningTitle: {
    color: '#28303B',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '800'
  },
  warningText: {
    color: '#687385',
    fontSize: 15,
    lineHeight: 22
  },
  section: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 14
  },
  sectionTitle: {
    color: '#28303B',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700'
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  tag: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  tagSelected: {
    backgroundColor: '#337EFF'
  },
  tagText: {
    color: '#5C6678',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700'
  },
  tagTextSelected: {
    color: '#FFFFFF'
  },
  textarea: {
    minHeight: 160,
    borderRadius: 18,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#2E3541',
    fontSize: 15,
    lineHeight: 22
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: '#D94A49',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800'
  }
})
