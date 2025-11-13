"use client"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { PlusIcon } from "lucide-react"
import type { Chat } from "./ChatInterface"

interface ChatSidebarProps {
  chats: Chat[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onClearActiveChat: () => void
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onClearActiveChat,
}: ChatSidebarProps) {
  const handleNewChat = () => {
    // Просто сбрасываем активный чат, чтобы показать центрированный инпут
    onClearActiveChat()
  }

  // Группируем чаты по датам
  const groupedChats = chats.reduce(
    (acc, chat) => {
      const today = new Date()
      const chatDate = new Date(chat.createdAt)
      const isToday =
        chatDate.getDate() === today.getDate() &&
        chatDate.getMonth() === today.getMonth() &&
        chatDate.getFullYear() === today.getFullYear()

      const period = isToday ? "Сегодня" : "Ранее"
      if (!acc[period]) {
        acc[period] = []
      }
      acc[period].push(chat)
      return acc
    },
    {} as Record<string, Chat[]>
  )

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
        <div className="flex flex-row items-center gap-2 px-2">
          <div className="bg-primary/10 size-8 rounded-md"></div>
          <div className="text-md font-base text-primary tracking-tight">
            csp-load-agent
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <div className="px-4">
          <Button
            variant="outline"
            className="mb-4 flex w-full items-center gap-2"
            onClick={handleNewChat}
          >
            <PlusIcon className="size-4" />
            <span>Новый чат</span>
          </Button>
        </div>
        {Object.keys(groupedChats).length === 0 ? (
          <div className="px-4 text-sm text-muted-foreground">
            Нет чатов. Создайте новый чат, чтобы начать общение.
          </div>
        ) : (
          Object.entries(groupedChats).map(([period, periodChats]) => (
            <SidebarGroup key={period}>
              <SidebarGroupLabel>{period}</SidebarGroupLabel>
              <SidebarMenu>
                {periodChats.map((chat) => (
                  <SidebarMenuButton
                    key={chat.id}
                    isActive={chat.id === activeChatId}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <span>{chat.title}</span>
                  </SidebarMenuButton>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
    </Sidebar>
  )
}

