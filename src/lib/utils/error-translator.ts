type ErrorCode =
  | 'validation_error'
  | 'duplicate_error'
  | 'not_found'
  | 'server_error'
  | 'network_error'
  | 'timeout_error'
  | 'offline_error'
  | 'unauthorized'
  | 'forbidden'

type Language = 'en' | 'hi'

interface ErrorMessage {
  en: string
  hi: string
}

const errorMessages: Record<ErrorCode, ErrorMessage> = {
  validation_error: {
    en: 'Please check the form for errors',
    hi: 'कृपया फॉर्म में त्रुटियां जांचें'
  },
  duplicate_error: {
    en: 'This record already exists',
    hi: 'यह रिकॉर्ड पहले से मौजूद है'
  },
  not_found: {
    en: 'Record not found',
    hi: 'रिकॉर्ड नहीं मिला'
  },
  server_error: {
    en: 'Something went wrong. Please try again.',
    hi: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।'
  },
  network_error: {
    en: 'Network error. Please check your connection.',
    hi: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।'
  },
  timeout_error: {
    en: 'Request timed out. Please try again.',
    hi: 'अनुरोध समय समाप्त हो गया। कृपया पुनः प्रयास करें।'
  },
  offline_error: {
    en: 'You are offline. Please check your internet connection.',
    hi: 'आप ऑफ़लाइन हैं। कृपया अपना इंटरनेट कनेक्शन जांचें।'
  },
  unauthorized: {
    en: 'You are not authorized to perform this action',
    hi: 'आप इस कार्य को करने के लिए अधिकृत नहीं हैं'
  },
  forbidden: {
    en: 'Access denied',
    hi: 'पहुंच अस्वीकार'
  }
}

export function translateError(errorCode: ErrorCode, language: Language = 'en'): string {
  return errorMessages[errorCode]?.[language] || errorMessages.server_error[language]
}

export function parseApiError(error: unknown): { code: ErrorCode; message?: string } {
  // Network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return { code: 'network_error' }
  }

  // Check if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { code: 'offline_error' }
  }

  // API error response
  if (error && typeof error === 'object') {
    if ('error' in error) {
      const apiError = error as { error: string; message?: string }

      switch (apiError.error) {
        case 'validation_error':
          return { code: 'validation_error', message: apiError.message }
        case 'duplicate_error':
          return { code: 'duplicate_error', message: apiError.message }
        case 'not_found':
          return { code: 'not_found', message: apiError.message }
        case 'unauthorized':
          return { code: 'unauthorized', message: apiError.message }
        case 'forbidden':
          return { code: 'forbidden', message: apiError.message }
        default:
          return { code: 'server_error', message: apiError.message }
      }
    }

    if ('status' in error) {
      const statusError = error as { status: number }

      switch (statusError.status) {
        case 401:
          return { code: 'unauthorized' }
        case 403:
          return { code: 'forbidden' }
        case 404:
          return { code: 'not_found' }
        case 408:
          return { code: 'timeout_error' }
        case 409:
          return { code: 'duplicate_error' }
        default:
          return { code: 'server_error' }
      }
    }
  }

  return { code: 'server_error' }
}

export function getErrorMessage(error: unknown, language: Language = 'en'): string {
  const { code, message } = parseApiError(error)
  return message || translateError(code, language)
}
