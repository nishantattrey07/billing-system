'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'
import { useStore } from '@/lib/store/useStore'

import enMessages from '../../messages/en.json'
import hiMessages from '../../messages/hi.json'

const messages = {
  en: enMessages,
  hi: hiMessages,
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useStore((state) => state.language)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <NextIntlClientProvider locale={language} messages={messages[language]}>
      {children}
    </NextIntlClientProvider>
  )
}
