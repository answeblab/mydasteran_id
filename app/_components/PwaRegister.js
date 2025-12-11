'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => {
          console.error('SW registration failed:', err)
        })
    }
  }, [])

  return null
}
