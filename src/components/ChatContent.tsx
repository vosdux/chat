import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ui/message"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"
import { ScrollButton } from "@/components/ui/scroll-button"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Loader } from '@/components/ui/loader'
import { cn } from "@/lib/utils"
import {
  ArrowUp,
  BrainIcon,
  Copy,
  Mic,
  Paperclip,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { chatService, sessionService } from "@/services/api"
import type { Chat } from "./ChatInterface"

export interface Message {
  id: number
  role: "user" | "assistant"
  content: string
}

interface ChatContentProps {
  activeChat: Chat | null
  onNewChat: (chat: Chat) => void
  messages?: Message[]
  onMessagesChange?: (chatId: string, messages: Message[]) => void
}

const suggestionGroups = [
  {
    label: "Популярные вопросы",
    highlight: "Как",
    items: [
      "Как провалидировать форму?",
      "Как помочь с кодом?",
      "Как помочь с дизайном?",
      "Как помочь с исследованием?",
    ],
  },
]

// Временный user_id, в реальном приложении должен браться из контекста/авторизации
const USER_ID = 'user_tests'

export function ChatContent({
  activeChat,
  onNewChat,
  messages = [],
  onMessagesChange,
}: ChatContentProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Скроллим вниз после получения ответа
  useEffect(() => {
    if (!isLoading && messages.length > 0 && chatContainerRef.current) {
      // Небольшая задержка для того, чтобы DOM успел обновиться
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: "smooth",
          })
        }
      }, 100)
    }
  }, [isLoading, messages.length])

  // Вспомогательная функция для обновления сообщений
  const updateMessages = (newMessages: Message[], chatId?: string) => {
    if (onMessagesChange) {
      const targetChatId = chatId || activeChat?.id
      if (targetChatId) {
        onMessagesChange(targetChatId, newMessages)
      }
    }
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    const userMessage = prompt.trim()
    setIsLoading(true)
    setActiveCategory("")

    let currentChat = activeChat
    let sessionId: number
    const newUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
    }

    // Если нет активного чата или это новый чат без сессии, создаем сессию
    if (!currentChat || currentChat.sessionId === 0) {
      try {
        const sessionResponse = await sessionService.createSession(USER_ID)
        sessionId = sessionResponse.session_id

        // Создаем новый чат
        const newChat: Chat = {
          id: currentChat?.id || `chat-${Date.now()}`,
          sessionId: sessionId,
          title: userMessage.slice(0, 50) || "Новый чат",
          createdAt: currentChat?.createdAt || new Date(),
        }
        
        onNewChat(newChat)
        currentChat = newChat
        
        // Добавляем сообщение пользователя в новый чат
        updateMessages([newUserMessage], newChat.id)
      } catch (error) {
        console.error("Error creating session:", error)
        setIsLoading(false)
        const errorResponse: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: "Ошибка при создании сессии. Пожалуйста, попробуйте еще раз.",
        }
        // Если есть активный чат, добавляем ошибку, иначе просто очищаем поле
        if (activeChat) {
          updateMessages([...messages, newUserMessage, errorResponse])
        }
        setPrompt("")
        return
      }
    } else {
      sessionId = currentChat.sessionId
      // Добавляем сообщение пользователя сразу
      updateMessages([...messages, newUserMessage], currentChat.id)
    }

    // Сохраняем актуальный список сообщений с учетом уже добавленного сообщения пользователя
    const messagesWithUser = currentChat.id === activeChat?.id 
      ? [...messages, newUserMessage]
      : [newUserMessage]

    try {
      // Call API
      const response = await chatService.chat(sessionId, userMessage)

      const assistantResponse: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.response || "",
      }

      // Добавляем ответ ассистента к актуальному списку сообщений
      updateMessages([...messagesWithUser, assistantResponse], currentChat.id)
    } catch (error) {
      console.error("Error calling chat API:", error)
      const errorResponse: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
      }
      // Добавляем ошибку к актуальному списку сообщений
      updateMessages([...messagesWithUser, errorResponse], currentChat.id)
    } finally {
      setIsLoading(false)
      // Очищаем поле ввода только после получения ответа (успешного или с ошибкой)
      setPrompt("")
    }
  }

  // Get suggestions based on active category
  const activeCategoryData = suggestionGroups.find(
    (group) => group.label === activeCategory
  )

  // Determine which suggestions to show
  const showCategorySuggestions = activeCategory !== ""

  const hasMessages = messages.length > 0
  const hasActiveChat = activeChat !== null
  // Если нет активного чата, показываем центрированный layout
  if (!hasActiveChat) {
    return (
      <main className="flex h-full flex-col overflow-hidden">
        <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="text-foreground">csp-load-agent</div>
        </header>

        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-3xl space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Чем я могу помочь?
              </h2>
            </div>
            {!prompt.trim() && (
              <div className="flex flex-wrap gap-2 justify-center">
                <PromptSuggestion
                  variant="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium"
                  onClick={() =>
                    setPrompt("Провалидировать форму http://localhost:3000/form/{Ваш id}")
                  }
                >
                  Провалидировать
                </PromptSuggestion>
                {showCategorySuggestions ? (
                  <div className="flex w-full flex-col space-y-1">
                    {activeCategoryData?.items.map((suggestion) => (
                      <PromptSuggestion
                        key={suggestion}
                        highlight={activeCategoryData.highlight}
                        onClick={() => {
                          setPrompt(suggestion)
                        }}
                      >
                        {suggestion}
                      </PromptSuggestion>
                    ))}
                  </div>
                ) : (
                  suggestionGroups.map((suggestion) => (
                    <PromptSuggestion
                      key={suggestion.label}
                      onClick={() => {
                        setActiveCategory(suggestion.label)
                        setPrompt("")
                      }}
                      className="capitalize"
                    >
                      <BrainIcon className="mr-2 h-4 w-4" />
                      {suggestion.label}
                    </PromptSuggestion>
                  ))
                )}
              </div>
            )}
            <PromptInput
              isLoading={isLoading}
              value={prompt}
              onValueChange={setPrompt}
              onSubmit={handleSubmit}
              className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
            >
              <div className="flex flex-col">
                <PromptInputTextarea
                  placeholder="Задать вопрос"
                  className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
                />

                <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <PromptInputAction tooltip="Add a new action">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-full"
                      >
                        <Paperclip size={18} />
                      </Button>
                    </PromptInputAction>
                  </div>
                  <div className="flex items-center gap-2">
                    <PromptInputAction tooltip="Voice input">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-full"
                      >
                        <Mic size={18} />
                      </Button>
                    </PromptInputAction>

                    <Button
                      size="icon"
                      disabled={!prompt.trim() || isLoading}
                      onClick={handleSubmit}
                      className="size-9 rounded-full"
                    >
                      {!isLoading ? (
                        <ArrowUp size={18} />
                      ) : (
                        <span className="size-3 rounded-xs bg-white" />
                      )}
                    </Button>
                  </div>
                </PromptInputActions>
              </div>
            </PromptInput>
          </div>
        </div>
      </main>
    )
  }

  // Обычный layout когда есть активный чат
  return (
    <main className="flex h-full flex-col overflow-hidden">
      <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="text-foreground">{activeChat.title}</div>
      </header>

      <div
        ref={chatContainerRef}
        className="relative flex-1 overflow-y-auto max-h-[100%]"
      >
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-0 px-5 py-12">
            {!hasMessages && !isLoading && (
              <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center py-12 text-center">
                <div className="text-muted-foreground text-sm">
                  Начните новую беседу, задав вопрос
                </div>
              </div>
            )}
            {messages.map((message, index) => {
              const isAssistant = message.role === "assistant"
              const isLastMessage = index === messages.length - 1

              return (
                <Message
                  key={message.id}
                  className={cn(
                    "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
                    isAssistant ? "items-start" : "items-end"
                  )}
                >
                  {isAssistant ? (
                    <div className="group flex w-full flex-col gap-0">
                      <MessageContent
                        className="text-foreground prose flex-1 rounded-lg bg-transparent p-0"
                        markdown
                      >
                        {message.content}
                      </MessageContent>
                      <MessageActions
                        className={cn(
                          "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                          isLastMessage && "opacity-100"
                        )}
                      >
                        <MessageAction tooltip="Copy" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Copy />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Upvote" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <ThumbsUp />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Downvote" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <ThumbsDown />
                          </Button>
                        </MessageAction>
                      </MessageActions>
                    </div>
                  ) : (
                    <div className="group flex flex-col items-end gap-1">
                      <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 sm:max-w-[100%]">
                        {message.content}
                      </MessageContent>
                      <MessageActions
                        className={cn(
                          "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        )}
                      >
                        <MessageAction tooltip="Edit" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Pencil />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Delete" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Trash />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Copy" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Copy />
                          </Button>
                        </MessageAction>
                      </MessageActions>
                    </div>
                  )}
                </Message>
              )
            })}
            {isLoading && (
              <Message
                className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 items-start"
              >
                <div className="group flex w-full flex-col gap-0">
                  <Loader variant="dots" />
                </div>
              </Message>
            )}
          </ChatContainerContent>
          <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      </div>

      <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <div className="mx-auto max-w-3xl space-y-4">
          {!prompt.trim() && (
            <div className="flex flex-wrap gap-2">
              <PromptSuggestion
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium"
                onClick={() =>
                  setPrompt("Провалидировать форму http://localhost:3000/form/{Ваш id}")
                }
              >
                Провалидировать
              </PromptSuggestion>
              {showCategorySuggestions ? (
                <div className="flex w-full flex-col space-y-1">
                  {activeCategoryData?.items.map((suggestion) => (
                    <PromptSuggestion
                      key={suggestion}
                      highlight={activeCategoryData.highlight}
                      onClick={() => {
                        setPrompt(suggestion)
                      }}
                    >
                      {suggestion}
                    </PromptSuggestion>
                  ))}
                </div>
              ) : (
                suggestionGroups.map((suggestion) => (
                  <PromptSuggestion
                    key={suggestion.label}
                    onClick={() => {
                      setActiveCategory(suggestion.label)
                      setPrompt("")
                    }}
                    className="capitalize"
                  >
                    <BrainIcon className="mr-2 h-4 w-4" />
                    {suggestion.label}
                  </PromptSuggestion>
                ))
              )}
            </div>
          )}
          <PromptInput
            isLoading={isLoading}
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={handleSubmit}
            className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
          >
            <div className="flex flex-col">
              <PromptInputTextarea
                placeholder="Задать вопрос"
                className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
              />

              <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                <div className="flex items-center gap-2">
                  <PromptInputAction tooltip="Add a new action">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Paperclip size={18} />
                    </Button>
                  </PromptInputAction>
                </div>
                <div className="flex items-center gap-2">
                  <PromptInputAction tooltip="Voice input">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Mic size={18} />
                    </Button>
                  </PromptInputAction>

                  <Button
                    size="icon"
                    disabled={!prompt.trim() || isLoading}
                    onClick={handleSubmit}
                    className="size-9 rounded-full"
                  >
                    {!isLoading ? (
                      <ArrowUp size={18} />
                    ) : (
                      <span className="size-3 rounded-xs bg-white" />
                    )}
                  </Button>
                </div>
              </PromptInputActions>
            </div>
          </PromptInput>
        </div>
      </div>
    </main>
  )
}

