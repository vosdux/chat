const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface ChatRequest {
  session_id: number
  message: string
}

export interface ChatResponse {
  response: string
}

export const chatService = {
  async chat(sessionId: number, message: string): Promise<ChatResponse> {
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

