# Chat Page Template

```tsx
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { Button, FlatList, Text, TextInput, View } from 'react-native'

import { messageStore } from '@/stores'

export const ChatPage = observer(({ sessionId }: { sessionId: string }) => {
  const [text, setText] = useState('')
  const state = messageStore.getConversationState(sessionId)

  useEffect(() => {
    if (!state.isSync) {
      messageStore.loadHistory(sessionId)
    }
  }, [sessionId, state.isSync])

  return (
    <View>
      <FlatList
        data={state.list}
        keyExtractor={(item) => item.clientId || item.messageId}
        renderItem={({ item }) => <Text>{item.text || item.type}</Text>}
      />
      <TextInput value={text} onChangeText={setText} placeholder="Type a message" />
      <Button
        title="Send"
        onPress={async () => {
          await messageStore.sendText(sessionId, text)
          setText('')
        }}
      />
    </View>
  )
})
```

## 要点

- 页面只消费消息状态
- 拉历史和发送动作都走 store
