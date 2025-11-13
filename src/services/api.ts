const API_URL = import.meta.env.VITE_API_URL || ''
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API || false

// Фейковые ответы для тестирования
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms))

const generateMockChatResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('провалидировать') || lowerMessage.includes('форма')) {
    return `Я помогу вам провалидировать форму. Пожалуйста, предоставьте URL формы или её ID, и я проверю её на соответствие требованиям.`
  }
  
  if (lowerMessage.includes('код')) {
    return `Я могу помочь с кодом! Расскажите, что именно вас интересует: отладка, рефакторинг, оптимизация или что-то другое?`
  }
  
  if (lowerMessage.includes('дизайн')) {
    return `С удовольствием помогу с дизайном! Опишите вашу задачу, и я предложу решения.`
  }
  
  if (lowerMessage.includes('исследование') || lowerMessage.includes('исследовать')) {
    return `Для исследования важно определить цели и методологию. Что именно вы хотите исследовать?`
  }
  
  // Общий ответ
  return `Спасибо за ваш вопрос: "${message}". Я обработал ваш запрос и готов помочь. Это фейковый ответ для тестирования интерфейса.`
}

export interface ChatRequest {
  session_id: number
  message: string
}

export interface ChatResponse {
  response: string
}

export interface SessionRequest {
  user_id: number
}

export interface SessionResponse {
  session_id: number
}

export const chatService = {
  async chat(sessionId: number, message: string): Promise<ChatResponse> {
    if (USE_MOCK_API) {
      // Фейковый ответ с задержкой
      await mockDelay(800 + Math.random() * 400) // 800-1200ms
      return {
        response: generateMockChatResponse(message)
      }
    }

    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },
}

export const sessionService = {
  async createSession(userId: string): Promise<SessionResponse> {
    if (USE_MOCK_API) {
      // Фейковый ответ с задержкой
      await mockDelay(1000 + Math.random() * 200) // 300-500ms
      // Генерируем уникальный session_id на основе времени и userId
      const sessionId = Date.now() % 1000000 // Простое число для тестирования
      return {
        session_id: sessionId
      }
    }

    const response = await fetch(`${API_URL}/api/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },
}

