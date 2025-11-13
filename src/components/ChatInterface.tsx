"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChatSidebar } from "./ChatSidebar"
import { ChatContent } from "./ChatContent"

function FullChatApp() {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <ChatContent />
      </SidebarInset>
    </SidebarProvider>
  )
}

export { FullChatApp }
