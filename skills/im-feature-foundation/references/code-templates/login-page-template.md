# Login Page Template

```tsx
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Button, TextInput, View } from 'react-native'

import { authStore } from '@/stores'

export const LoginPage = observer(() => {
  const [account, setAccount] = useState('')
  const [credential, setCredential] = useState('')

  return (
    <View>
      <TextInput value={account} onChangeText={setAccount} placeholder="Account" />
      <TextInput value={credential} onChangeText={setCredential} placeholder="Credential" />
      <Button
        title={authStore.isLoggingIn ? 'Logging in...' : 'Login'}
        onPress={() => authStore.login(account, credential)}
      />
    </View>
  )
})
```

## 要点

- 页面只负责输入和交互
- 登录流程仍由 store 负责编排
