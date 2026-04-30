# Conversations Page Template

```tsx
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'

import { sessionStore } from '@/stores'

export const ConversationsPage = observer(() => {
  useEffect(() => {
    sessionStore.refresh()
  }, [])

  return (
    <View>
      <FlatList
        data={sessionStore.sessions}
        keyExtractor={(item) => item.sessionId}
        renderItem={({ item }) => (
          <Pressable onPress={() => {/* TODO: navigate to chat */}}>
            <Text>{item.title}</Text>
            <Text>{item.lastMessageText}</Text>
          </Pressable>
        )}
      />
    </View>
  )
})
```

## 要点

- 页面负责展示和跳转
- 列表刷新和未读处理在 store
