"use client"

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
import { useRef, useState } from "react"
import { chatService } from "@/services/api"

// Initial chat messages
const initialMessages = [
  {
    id: 1,
    role: "assistant",
    content: "Привет! Как я могу помочь вам?",
  },
]

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

export function ChatContent() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState(initialMessages)
  const [activeCategory, setActiveCategory] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    const userMessage = prompt.trim()
    setPrompt("")
    setIsLoading(true)
    setActiveCategory("")

    // Add user message immediately
    const newUserMessage = {
      id: chatMessages.length + 1,
      role: "user",
      content: userMessage,
    }

    setChatMessages([...chatMessages, newUserMessage])

    try {
      // Call API
      const response = await chatService.chat(1, userMessage)

      const assistantResponse = {
        id: chatMessages.length + 2,
        role: "assistant",
        content: response.response || "",
      }

      setChatMessages((prev) => [...prev, assistantResponse])
    } catch (error) {
      console.error("Error calling chat API:", error)
      const errorResponse = {
        id: chatMessages.length + 2,
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
      }
      setChatMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  // Get suggestions based on active category
  const activeCategoryData = suggestionGroups.find(
    (group) => group.label === activeCategory
  )

  // Determine which suggestions to show
  const showCategorySuggestions = activeCategory !== ""

  return (
    <main className="flex h-full flex-col overflow-hidden">
      <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="text-foreground">Текущий чат</div>
      </header>

      <div
        ref={chatContainerRef}
        className="relative flex-1 overflow-y-auto max-h-[100%]"
      >
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-0 px-5 py-12">
            {chatMessages.map((message, index) => {
              const isAssistant = message.role === "assistant"
              const isLastMessage = index === chatMessages.length - 1

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
                        // Optional: auto-send
                        // handleSend()
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
                      setPrompt("") // Clear input when selecting a category
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

