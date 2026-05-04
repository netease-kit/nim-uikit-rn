import AsyncStorage from '@react-native-async-storage/async-storage'

type StorageLike = {
  getItem: (key: string) => Promise<string | null> | string | null
  setItem: (key: string, value: string) => Promise<void> | void
  removeItem: (key: string) => Promise<void> | void
}

const memoryStorage = new Map<string, string>()

const memoryBackend: StorageLike = {
  getItem(key) {
    return memoryStorage.get(key) ?? null
  },
  setItem(key, value) {
    memoryStorage.set(key, value)
  },
  removeItem(key) {
    memoryStorage.delete(key)
  }
}

function getLocalStorageBackend(): StorageLike | null {
  if (typeof globalThis.localStorage === 'undefined') {
    return null
  }

  return {
    getItem(key) {
      return globalThis.localStorage.getItem(key)
    },
    setItem(key, value) {
      globalThis.localStorage.setItem(key, value)
    },
    removeItem(key) {
      globalThis.localStorage.removeItem(key)
    }
  }
}

function getAsyncStorageBackend(): StorageLike | null {
  if (
    !AsyncStorage ||
    typeof AsyncStorage.getItem !== 'function' ||
    typeof AsyncStorage.setItem !== 'function' ||
    typeof AsyncStorage.removeItem !== 'function'
  ) {
    return null
  }

  return AsyncStorage
}

async function safeRead(
  backend: StorageLike,
  key: string
): Promise<{ ok: true; value: string | null } | { ok: false }> {
  try {
    return { ok: true, value: await backend.getItem(key) }
  } catch {
    return { ok: false }
  }
}

async function safeWrite(backend: StorageLike, key: string, value: string): Promise<boolean> {
  try {
    await backend.setItem(key, value)
    return true
  } catch {
    return false
  }
}

async function safeRemove(backend: StorageLike, key: string): Promise<boolean> {
  try {
    await backend.removeItem(key)
    return true
  } catch {
    return false
  }
}

async function resolveReadableBackend() {
  const localStorageBackend = getLocalStorageBackend()

  if (localStorageBackend) {
    const result = await safeRead(localStorageBackend, '__storage_probe__')

    if (result.ok) {
      return localStorageBackend
    }
  }

  const asyncStorageBackend = getAsyncStorageBackend()

  if (asyncStorageBackend) {
    const result = await safeRead(asyncStorageBackend, '__storage_probe__')

    if (result.ok) {
      return asyncStorageBackend
    }
  }

  return memoryBackend
}

async function resolveWritableBackend() {
  const localStorageBackend = getLocalStorageBackend()

  if (localStorageBackend) {
    const success = await safeWrite(localStorageBackend, '__storage_probe__', '1')

    if (success) {
      await safeRemove(localStorageBackend, '__storage_probe__')
      return localStorageBackend
    }
  }

  const asyncStorageBackend = getAsyncStorageBackend()

  if (asyncStorageBackend) {
    const success = await safeWrite(asyncStorageBackend, '__storage_probe__', '1')

    if (success) {
      await safeRemove(asyncStorageBackend, '__storage_probe__')
      return asyncStorageBackend
    }
  }

  return memoryBackend
}

export const storage = {
  async getString(key: string) {
    const backend = await resolveReadableBackend()
    const result = await safeRead(backend, key)
    return result.ok ? result.value : null
  },

  async setString(key: string, value: string) {
    const backend = await resolveWritableBackend()
    await safeWrite(backend, key, value)
  },

  async remove(key: string) {
    const backend = await resolveWritableBackend()
    await safeRemove(backend, key)
  },

  async getJson<T>(key: string): Promise<T | null> {
    const backend = await resolveReadableBackend()
    const result = await safeRead(backend, key)

    if (!result.ok || !result.value) {
      return null
    }

    try {
      return JSON.parse(result.value) as T
    } catch {
      await safeRemove(backend, key)
      return null
    }
  },

  async setJson(key: string, value: unknown) {
    const backend = await resolveWritableBackend()
    await safeWrite(backend, key, JSON.stringify(value))
  }
}
