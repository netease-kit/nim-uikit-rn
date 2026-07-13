import { useFocusEffect } from 'expo-router'
import { useCallback, useRef, useState } from 'react'

export function useNavigationLock() {
  const lockedRef = useRef(false)
  const [, setLockRevision] = useState(0)

  const setLocked = useCallback((value: boolean) => {
    if (lockedRef.current === value) {
      return
    }

    lockedRef.current = value
    setLockRevision((revision) => revision + 1)
  }, [])

  useFocusEffect(
    useCallback(() => {
      setLocked(false)
    }, [setLocked])
  )

  const runWithNavigationLock = useCallback(
    (action: () => void) => {
      if (lockedRef.current) {
        return false
      }

      setLocked(true)
      action()
      return true
    },
    [setLocked]
  )

  const isNavigationLocked = useCallback(() => lockedRef.current, [])

  const resetNavigationLock = useCallback(() => {
    setLocked(false)
  }, [setLocked])

  return {
    runWithNavigationLock,
    isNavigationLocked,
    resetNavigationLock
  }
}
