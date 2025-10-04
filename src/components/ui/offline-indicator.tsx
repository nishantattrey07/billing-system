'use client'

import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus'
import { WifiOff, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useNetworkStatus()
  const locale = useLocale() as 'en' | 'hi'

  const messages = {
    offline: {
      en: 'You are offline',
      hi: 'आप ऑफ़लाइन हैं'
    },
    online: {
      en: 'Back online',
      hi: 'फिर से ऑनलाइन'
    }
  }

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2"
        >
          <div className="container mx-auto flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">{messages.offline[locale]}</span>
          </div>
        </motion.div>
      )}

      {wasOffline && isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2"
        >
          <div className="container mx-auto flex items-center justify-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">{messages.online[locale]}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
