import { useCallback, useMemo } from 'react'

import { preferenceStore } from '@/stores'
import { getSystemLanguage, resolveAppLanguage, translateApp } from '@/utils/app-language'

export function useAppTranslation() {
  const language = resolveAppLanguage(preferenceStore.preferences.language, getSystemLanguage())
  const t = useCallback(
    (key: Parameters<typeof translateApp>[1], params?: Parameters<typeof translateApp>[2]) =>
      translateApp(language, key, params),
    [language]
  )

  return useMemo(
    () => ({
      language,
      t
    }),
    [language, t]
  )
}
