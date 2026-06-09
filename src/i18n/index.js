import { createI18n } from 'vue-i18n'
import ru from './locales/ru.js'
import en from './locales/en.js'

const savedLocale = localStorage.getItem('locale') ?? 'ru'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { ru, en }
})

export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
}
