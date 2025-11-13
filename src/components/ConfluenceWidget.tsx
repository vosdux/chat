import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FullChatApp } from "./ChatInterface"

export function ConfluenceWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6 py-6 h-auto"
            size="lg"
          >
            Ассистент
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="max-w-7xl w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden z-[99999]"
          showCloseButton={true}
        >
          <FullChatApp />
        </DialogContent>
      </Dialog>
    </div>
  )
}

