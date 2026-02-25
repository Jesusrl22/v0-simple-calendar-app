"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: Array<{ id: string; question: string }>
  contact_email?: string
}

export function HelpChatbot() {
  const { language } = useLanguage()
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [welcomeShown, setWelcomeShown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Cuando se abre el chatbot, mostrar mensaje de bienvenida
  useEffect(() => {
    if (isOpen && !welcomeShown) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "assistant",
        content: t("help_chatbot_welcome"),
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
      setWelcomeShown(true)
    }
  }, [isOpen, welcomeShown])

  // Cuando cambia el idioma, actualizar el mensaje de bienvenida
  useEffect(() => {
    if (messages.length > 0 && messages[0].id === "welcome" && welcomeShown) {
      // Actualizar el contenido del mensaje de bienvenida con el nuevo idioma
      const updatedMessage = { ...messages[0], content: t("help_chatbot_welcome") }
      setMessages([updatedMessage, ...messages.slice(1)])
    }
  }, [language])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/help-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.answer || t("help_chatbot_error"),
        timestamp: new Date(),
        suggestions: data.suggestions,
        contact_email: data.contact_email,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Help chatbot error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `${t("help_chatbot_error") || "An error occurred. Please try again."}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: { id: string; question: string }) => {
    setInput(suggestion.question)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg flex items-center justify-center transition-all hover:scale-110 neon-glow"
        aria-label="Open help chatbot"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-40 w-96 h-[500px] flex flex-col shadow-xl border border-border bg-card">
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold">{t("help_chatbot_title") || "Help & Support"}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:opacity-80 p-1 rounded transition-opacity"
              aria-label="Close help chatbot"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-secondary-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs opacity-75 font-semibold">
                        {t("help_chatbot_related_questions")}
                      </p>
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left text-xs bg-background/50 hover:bg-background/80 px-2 py-1 rounded border border-border/50 transition-colors"
                        >
                          • {suggestion.question}
                        </button>
                      ))}
                    </div>
                  )}

                  {message.contact_email && (
                    <div className="mt-3 pt-3 border-t border-secondary/20">
                      <p className="text-xs opacity-75">
                        {t("help_chatbot_need_more_help")}
                      </p>
                      <p className="text-xs font-semibold select-all cursor-text bg-background/50 px-2 py-1 rounded border border-border/50 mt-2">
                        {message.contact_email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-3 flex gap-2 bg-card">
            <Input
              type="text"
              placeholder={t("help_chatbot_input") || "Ask a question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="flex-1 bg-input border-border"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="sm"
              className="bg-primary hover:bg-primary/80 text-primary-foreground"
            >
              <Send size={16} />
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}
