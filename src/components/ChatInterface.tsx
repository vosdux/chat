"use client"

import { useState, useCallback } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChatSidebar } from "./ChatSidebar"
import { ChatContent, type Message } from "./ChatContent"

export interface Chat {
  id: string
  sessionId: number
  title: string
  createdAt: Date
}

function FullChatApp() {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  // Храним сообщения для каждого чата
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({})

  const handleNewChat = (chat: Chat) => {
    setChats((prev) => {
      // Если чат с таким ID уже существует, обновляем его
      const existingIndex = prev.findIndex((c) => c.id === chat.id)
      if (existingIndex !== -1) {
        const updated = [...prev]
        updated[existingIndex] = chat
        return updated
      }
      // Иначе добавляем новый чат в начало списка
      return [chat, ...prev]
    })
    setActiveChatId(chat.id)
  }

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId)
  }

  const handleClearActiveChat = () => {
    setActiveChatId(null)
  }

  const handleMessagesChange = useCallback((chatId: string, messages: Message[]) => {
    setChatMessages((prev) => {
      // Проверяем, действительно ли сообщения изменились
      const prevMessages = prev[chatId]
      if (prevMessages && JSON.stringify(prevMessages) === JSON.stringify(messages)) {
        return prev // Не обновляем, если сообщения не изменились
      }
      return {
        ...prev,
        [chatId]: messages,
      }
    })
  }, [])

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null
  const activeChatMessages = activeChat ? chatMessages[activeChat.id] || [] : []

  return (
    <SidebarProvider>
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onClearActiveChat={handleClearActiveChat}
      />
      <SidebarInset>
        <ChatContent
          activeChat={activeChat}
          onNewChat={handleNewChat}
          messages={activeChatMessages}
          onMessagesChange={handleMessagesChange}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}

export { FullChatApp }
