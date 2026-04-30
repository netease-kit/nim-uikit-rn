import en from '../locales/en'
import zh from '../locales/zh'

const i18nData: any = {
  en,
  zh
}

function getInitialLanguage() {
  if (typeof localStorage === 'undefined') {
    return 'zh'
  }

  try {
    return localStorage.getItem('switchToEnglishFlag') === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

let currentLanguage: string = getInitialLanguage()

export function setLanguage(language: string) {
  currentLanguage = language
}

export const t = (key: string) => {
  return i18nData[currentLanguage][key] || key
}
