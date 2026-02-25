"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Zap, Plus, Trash2, Menu, X, Upload } from "@/components/icons"
import { useTranslation } from "@/hooks/useTranslation"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-toastify"
import { getAICredits } from "@/lib/subscription"

const supabase = createClient()

// Generate UUID v4
const generateUUID = () => {
  return crypto.randomUUID()
}

interface Message {
  role: string
  content: string
  fileInfo?: { name: string; type: string; base64?: string }
}

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages: Message[]
  mode: "chat" | "study" | "analyze"
}

const AIPage = () => {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showRightSidebar, setShowRightSidebar] = useState(false)
  const [aiMode, setAiMode] = useState<"chat" | "study" | "analyze">("chat")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [selectedMessageToSave, setSelectedMessageToSave] = useState<string | null>(null)
  const [saveType, setSaveType] = useState<"calendar" | "task" | null>(null)
  const [saveTitle, setSaveTitle] = useState("")
  const [saveDescription, setSaveDescription] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [filePreviewData, setFilePreviewData] = useState<{
    file: File
    extractedPreview: string
  } | null>(null)

  const [profileData, setProfileData] = useState({
    tier: "free" as string,
    monthlyCredits: 0,
    purchasedCredits: 0,
  })
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)

  // Calculate max credits based on tier
  const maxMonthlyCredits = getAICredits(profileData.tier as "free" | "premium" | "pro")
  const totalMaxCredits = maxMonthlyCredits + profileData.purchasedCredits

  const SUGGESTED_PROMPTS = {
    chat: [t("study_tips") || "Ask me anything", t("productivity_tips") || "Get productivity advice"],
    study: [
      t("study_create_plan") || "Create a study plan",
      t("study_explain_concept") || "Explain this concept",
      t("study_practice_questions") || "Generate practice questions",
    ],
    analyze: [
      t("analyze_summarize") || "Summarize this document",
      t("analyze_key_points") || "Extract key points",
      t("analyze_diagram") || "Create a visual diagram",
    ],
  }

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        console.log("[v0] Loading conversations from database")
        const response = await fetch("/api/ai-conversations", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        // Handle rate limiting
        if (response.status === 429) {
          console.warn("[v0] Rate limited loading conversations, will retry in 60s")
          // Don't throw, just wait and retry
          setTimeout(loadConversations, 60000)
          return
        }

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Loaded", data.length, "conversations from database")
          setConversations(data)
          
          // If there are conversations, load the most recent one
          if (data.length > 0) {
            const mostRecent = data[0]
            setCurrentConversationId(mostRecent.id)
            setMessages(mostRecent.messages || [])
            setAiMode(mostRecent.mode || "chat")
            console.log("[v0] Loaded most recent conversation:", mostRecent.id)
          }
        } else {
          console.warn("[v0] Failed to load conversations:", response.status)
        }
      } catch (error) {
        console.error("[v0] Error loading conversations:", error)
      } finally {
        setIsLoadingConversations(false)
      }
    }

    loadConversations()
  }, [])

  // Auto-save conversation when messages change (debounced)
  useEffect(() => {
    if (messages.length === 0 || !currentConversationId) return

    const saveTimer = setTimeout(() => {
      console.log("[v0] Auto-saving conversation due to message changes")
      saveConversation(currentConversationId, messages)
    }, 2000) // Espera 2 segundos después del último cambio

    return () => clearTimeout(saveTimer)
  }, [messages, currentConversationId])

  const compressImage = async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) return ""

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          // Max 1200px width, maintain aspect ratio
          if (width > 1200) {
            height = (height * 1200) / width
            width = 1200
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)

          // Convert to base64 with quality reduction
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7)
          resolve(dataUrl)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const saveConversation = async (conversationId: string, messages: Message[]) => {
    try {
      console.log("[v0] Attempting to save conversation:", conversationId, "with", messages.length, "messages")
      
      const existingConv = conversations.find((c) => c.id === conversationId)

      const userMessage = messages.find((m) => m.role === "user")
      const title = userMessage?.content?.substring(0, 50) || t("new_conversation")

      console.log("[v0] Saving conversation with title:", title)

      const response = await fetch("/api/ai-conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: conversationId,
          title: title,
          messages: messages,
          mode: aiMode,
        }),
      })

      // Handle rate limiting
      if (response.status === 429) {
        console.warn("[v0] Rate limited saving conversation, will retry later")
        return
      }

      if (response.ok) {
        const savedData = await response.json()
        console.log("[v0] Conversation saved successfully:", savedData.id)
        
        // Create updated conversation object
        const updatedConv: Conversation = {
          id: conversationId,
          title,
          created_at: existingConv?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages,
          mode: aiMode,
        }

        // Update local conversations list
        if (existingConv) {
          // Update existing conversation
          const updated = conversations.map((c) =>
            c.id === conversationId ? updatedConv : c
          )
          setConversations(updated)
          console.log("[v0] Updated existing conversation in local state")
        } else {
          // Add new conversation to the top
          setConversations([updatedConv, ...conversations])
          setCurrentConversationId(conversationId)
          console.log("[v0] Added new conversation to local state")
        }
      } else {
        const errorText = await response.text()
        console.error("[v0] Failed to save conversation:", response.status, errorText)
      }
    } catch (error) {
      console.error("[v0] Error saving conversation:", error)
    }
  }

  const createNewConversation = async () => {
    // Save current conversation before creating a new one
    if (currentConversationId && messages.length > 0) {
      await saveConversation(currentConversationId, messages)
    }

    const newConversation: Conversation = {
      id: generateUUID(),
      title: t("new_conversation"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
      mode: aiMode,
    }
    
    // Add to local state and save to database
    const updated = [newConversation, ...conversations]
    setConversations(updated)
    setCurrentConversationId(newConversation.id)
    setMessages([])
    setInput("")
    setShowRightSidebar(false)
    
    // Save the new empty conversation to database
    await saveConversation(newConversation.id, [])
  }

  const loadConversation = async (conversationId: string) => {
    // Save current conversation before switching
    if (currentConversationId && messages.length > 0) {
      await saveConversation(currentConversationId, messages)
    }

    const conv = conversations.find((c) => c.id === conversationId)
    if (conv) {
      setCurrentConversationId(conversationId)
      setMessages(conv.messages || [])
      setInput("")
      setShowRightSidebar(false)
      setAiMode(conv.mode)
    }
  }

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(t("confirm_delete"))) return

    try {
      // Delete from database
      const response = await fetch(`/api/ai-conversations?id=${conversationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove from local state
        const updated = conversations.filter((c) => c.id !== conversationId)
        setConversations(updated)
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null)
          setMessages([])
        }
        toast({
          title: "Conversación eliminada",
          description: "La conversación se ha eliminado correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar la conversación",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting conversation:", error)
      toast({
        title: "Error",
        description: "Error al eliminar la conversación",
        variant: "destructive",
      })
    }
  }

  const getSystemPrompt = () => {
    const prompts = {
      chat: t("chat_system_prompt") || "You are a helpful AI assistant. Provide clear, concise answers.",
      study:
        t("study_system_prompt") ||
        "You are an expert study guide and tutor. Help users learn effectively with explanations, summaries, and practice questions. Create study plans, explain complex concepts, and generate learning materials.",
      analyze:
        t("analyze_system_prompt") ||
        "You are a document analysis expert. Analyze documents thoroughly and provide clear summaries, key points, and insights. Help extract information and create visual representations.",
    }
    return prompts[aiMode]
  }

  const handleSend = async () => {
    if (!input.trim() && !uploadedFile) return

    setLoading(true)
    const userMessage: Message = {
      role: "user",
      content: input || (uploadedFile ? `${t("analyze_this_file")}` : ""),
      fileInfo: uploadedFile
        ? {
            name: uploadedFile.name,
            type: uploadedFile.type,
            base64: filePreviewData?.file.type.startsWith("image/") ? filePreviewData.extractedPreview : undefined,
          }
        : undefined,
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")

    try {
      let endpoint = "/api/ai-chat"

      const userLanguage = typeof window !== "undefined" ? localStorage.getItem("language") || "en" : "en"

      if (uploadedFile && aiMode === "analyze") {
        endpoint = "/api/ai-chat-with-file"
        const formData = new FormData()
        formData.append("file", uploadedFile)
        formData.append("prompt", input || t("analyze_this_file"))
        formData.append("language", userLanguage)

        const session = await supabase.auth.getSession()
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
          body: formData,
        })
        if (!response.ok) throw new Error("Failed to process file")
        const data = await response.json()
        const assistantMessage: Message = { role: "assistant", content: data.response }
        const finalMessages = [...updatedMessages, assistantMessage]
        setMessages(finalMessages)
        
        // Create or use existing conversation for file uploads
        let convId = currentConversationId
        if (!convId) {
          // Create new conversation when sending first message
          convId = generateUUID()
          const newConv: Conversation = {
            id: convId,
            title: input?.substring(0, 50) || t("new_conversation"),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            messages: finalMessages,
            mode: aiMode,
          }
          setConversations([newConv, ...conversations])
          setCurrentConversationId(convId)
        }
        await saveConversation(convId, finalMessages)
        
        console.log("[v0] Updating credits from response:", data.creditsRemaining, data.remainingMonthlyCredits, data.remainingPurchasedCredits)
        setProfileData((prev) => {
          const newData = {
            ...prev,
            monthlyCredits: typeof data.remainingMonthlyCredits === "number" ? data.remainingMonthlyCredits : prev.monthlyCredits,
            purchasedCredits: typeof data.remainingPurchasedCredits === "number" ? data.remainingPurchasedCredits : prev.purchasedCredits,
          }
          console.log("[v0] New profile data:", newData)
          return newData
        })
        setUploadedFile(null)
        setFilePreviewData(null)
      } else {
        const session = await supabase.auth.getSession()
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
          body: JSON.stringify({
            message: input,
            language: userLanguage,
            mode: aiMode,
            systemPrompt: getSystemPrompt(),
          }),
        })
        if (!response.ok) throw new Error("Failed to send message")
        const data = await response.json()
        const assistantMessage: Message = { role: "assistant", content: data.response }
        const finalMessages = [...updatedMessages, assistantMessage]
        setMessages(finalMessages)
        
        // Create or use existing conversation for chat
        let convId = currentConversationId
        if (!convId) {
          // Create new conversation when sending first message
          convId = generateUUID()
          const newConv: Conversation = {
            id: convId,
            title: input.substring(0, 50) || t("new_conversation"),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            messages: finalMessages,
            mode: aiMode,
          }
          setConversations([newConv, ...conversations])
          setCurrentConversationId(convId)
        }
        await saveConversation(convId, finalMessages)
        
        console.log("[v0] Updating credits from chat response:", data.creditsRemaining, data.remainingMonthlyCredits, data.remainingPurchasedCredits)
        setProfileData((prev) => {
          const newData = {
            ...prev,
            monthlyCredits: typeof data.remainingMonthlyCredits === "number" ? data.remainingMonthlyCredits : prev.monthlyCredits,
            purchasedCredits: typeof data.remainingPurchasedCredits === "number" ? data.remainingPurchasedCredits : prev.purchasedCredits,
          }
          console.log("[v0] New profile data after chat:", newData)
          return newData
        })
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      toast.error(t("error_sending") || "Failed to send message")
      setMessages(updatedMessages.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileSize = file.size / 1024 / 1024 // MB
    if (fileSize > 20) {
      toast.error(t("file_too_large") || "File too large (max 20MB)")
      return
    }

    if (file.type.startsWith("image/")) {
      const compressed = await compressImage(file)
      // Create a File object from the compressed data for sending to API
      const blob = await fetch(compressed).then((r) => r.blob())
      const compressedFile = new File([blob], file.name, { type: "image/jpeg" })
      setUploadedFile(compressedFile)
    } else {
      setUploadedFile(file)
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        let preview = ""
        if (file.type === "application/pdf") {
          preview = `[PDF: ${file.name}] - Content will be analyzed...`
        } else if (file.type.startsWith("image/")) {
          preview = e.target?.result as string
        } else if (file.type.startsWith("text/") || file.type.includes("document")) {
          preview = (e.target?.result as string)?.substring(0, 500) || "[Document content]"
        }
        setFilePreviewData({ file, extractedPreview: preview })
      } catch (error) {
        console.error("[v0] Error processing file preview:", error)
        setFilePreviewData({ file, extractedPreview: `[File: ${file.name}]` })
      }
    }
    if (file.type.startsWith("text/")) {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    const sidebar = document.getElementById("mobile-right-sidebar")
    const menuButton = document.getElementById("menu-button")
    if (
      showRightSidebar &&
      sidebar &&
      !sidebar.contains(event.target as Node) &&
      !menuButton?.contains(event.target as Node)
    ) {
      setShowRightSidebar(false)
    }
  }

  const saveAsTask = async () => {
    if (!saveTitle.trim() || !selectedMessageToSave) return

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: saveTitle,
          description: selectedMessageToSave,
          priority: "medium",
          category: "study",
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
        }),
      })

      if (response.ok) {
        toast.success(t("task_saved_successfully"))
        setShowSaveDialog(false)
        setSaveTitle("")
        setSaveDescription("")
        setSelectedMessageToSave(null)
        setSaveType(null)
      } else {
        toast.error(t("error_saving_task"))
      }
    } catch (error) {
      toast.error(t("error_saving_task"))
    }
  }

  const saveToCalendar = async () => {
    if (!saveTitle.trim() || !selectedMessageToSave) return

    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: saveTitle,
          description: selectedMessageToSave,
          priority: "medium",
          category: "study",
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      })

      if (response.ok) {
        toast.success(t("event_saved_calendar"))
        setShowSaveDialog(false)
        setSaveTitle("")
        setSaveDescription("")
        setSelectedMessageToSave(null)
        setSaveType(null)
      } else {
        toast.error(t("error_saving_calendar"))
      }
    } catch (error) {
      toast.error(t("error_saving_calendar"))
    }
  }

  const showUpgradeModal = () => {
    toast.warning(t("upgrade_to_send_files"))
  }

  const hasAccessToAI =
    profileData.tier !== "free" || profileData.monthlyCredits > 0 || profileData.purchasedCredits > 0

  useEffect(() => {
    const loadConversations = async () => {
      try {
        console.log("[v0] Loading conversations from database...")
        
        const response = await fetch("/api/ai-conversations")

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Loaded conversations:", data.length)
          setConversations(data)
        } else {
          console.error("[v0] Failed to load conversations:", response.status, await response.text())
        }
      } catch (error) {
        console.error("[v0] Error loading conversations:", error)
      }
    }

    loadConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (showRightSidebar) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showRightSidebar])

  const monthlyCredits = profileData.monthlyCredits
  const purchasedCredits = profileData.purchasedCredits

  const handleModeChange = (mode: "chat" | "study" | "analyze") => {
    setAiMode(mode)
    setMessages([])
    setInput("")
    setUploadedFile(null)
    setFilePreviewData(null)
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("[v0] Loading initial AI page data...")
        
        // Load profile data
        const profileResponse = await fetch("/api/user/profile", {
          cache: "no-store",
        })

        if (profileResponse.ok) {
          const profile = await profileResponse.json()
          console.log("[v0] Loaded profile data:", profile.ai_credits, profile.ai_credits_purchased)
          setProfileData({
            tier: profile.subscription_tier || "free",
            monthlyCredits: profile.ai_credits || 0,
            purchasedCredits: profile.ai_credits_purchased || 0,
          })
        }
      } catch (error) {
        console.error("[v0] Error loading initial data:", error)
      }
    }

    loadInitialData()
  }, [])

  // Load conversation from URL parameter if present
  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    const conversationId = params.get("conversation")
    
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === conversationId)
      if (conv) {
        setCurrentConversationId(conversationId)
        setMessages(conv.messages || [])
        setAiMode(conv.mode)
      }
    }
  }, [conversations])

  return (
    <div className="flex h-screen flex-col bg-background md:flex-row">
      {/* Desktop Sidebar - Left side */}
      <div className="hidden md:flex w-64 bg-secondary/20 border-r border-border/50 flex-col p-4 gap-4 overflow-hidden">
        <Button onClick={createNewConversation} className="w-full neon-glow-hover">
          <Plus className="w-4 h-4 mr-2" />
          {t("new_conversation")}
        </Button>

        <div className="flex-1 overflow-y-auto space-y-2 border-t border-border/50 pt-4">
          {isLoadingConversations ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t("loading") || "Loading..."}</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t("no_conversations")}</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors text-sm flex items-center justify-between group overflow-hidden ${
                  currentConversationId === conv.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50"
                }`}
              >
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 gap-2 md:gap-4 p-2 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 md:gap-4 mb-4 md:mb-6">
          <h1 className="text-xl md:text-3xl font-bold truncate">{t("ai_assistant") || "AI Assistant"}</h1>

          <div className="flex gap-1 md:gap-2 shrink-0">
            {(profileData.monthlyCredits > 0 || profileData.purchasedCredits > 0) && (
              <Card className="glass-card px-1.5 md:px-3 py-1 md:py-2 neon-glow">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                  <span className="text-xs md:text-sm font-semibold">
                    {profileData.monthlyCredits + profileData.purchasedCredits}/{totalMaxCredits}
                  </span>
                </div>
              </Card>
            )}
            <Button
              id="menu-button"
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className="md:hidden shrink-0"
              size="sm"
            >
              {showRightSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Tabs value={aiMode} onValueChange={handleModeChange} className="mb-4">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/30">
            <TabsTrigger value="chat" className="text-xs md:text-sm">
              <span className="hidden sm:inline">{t("chat_mode") || "Chat"}</span>
              <span className="sm:hidden">💬</span>
            </TabsTrigger>
            <TabsTrigger value="study" className="text-xs md:text-sm">
              <span className="hidden sm:inline">{t("study_mode") || "Study"}</span>
              <span className="sm:hidden">📚</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" className="text-xs md:text-sm">
              <span className="hidden sm:inline">{t("analyze_mode") || "Analyze"}</span>
              <span className="sm:hidden">📄</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Show file preview if one is selected */}
          {filePreviewData && (
            <div className="m-4 rounded-lg border border-accent/20 bg-card p-4">
              <div className="flex items-center gap-3 pb-3">
                <div className="text-xl">
                  {filePreviewData.file.type.startsWith("image/")
                    ? "🖼️"
                    : filePreviewData.file.type === "application/pdf"
                      ? "📄"
                      : "📝"}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{filePreviewData.file.name}</h3>
                  <p className="text-sm text-muted-foreground">{(filePreviewData.file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null)
                    setFilePreviewData(null)
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              {filePreviewData.file.type.startsWith("text/") && (
                <div className="mt-3 max-h-40 overflow-y-auto rounded bg-background p-3 text-sm text-muted-foreground">
                  {filePreviewData.extractedPreview}
                </div>
              )}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 md:space-y-8 px-2 md:px-4">
              <div className="text-center space-y-2 md:space-y-4">
                <div className="text-4xl md:text-6xl mb-4">
                  {aiMode === "chat" && "💬"}
                  {aiMode === "study" && "📚"}
                  {aiMode === "analyze" && "📄"}
                </div>
                <h2 className="text-2xl md:text-5xl font-bold">{t("welcome_message")}</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  {(aiMode === "chat" && t("chat_description")) || "Ask me anything"}
                  {(aiMode === "study" && t("study_description")) || "Create study plans and learn effectively"}
                  {(aiMode === "analyze" && t("analyze_description")) || "Upload and analyze documents"}
                </p>
              </div>

              {/* Input and File Upload */}
              <div className="w-full max-w-2xl space-y-2 md:space-y-4">
                <div className="flex gap-1 md:gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder={t("input_placeholder")}
                    className="bg-secondary/50 text-xs md:text-sm"
                    disabled={loading}
                    autoFocus
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={loading || (!input.trim() && !uploadedFile)}
                    className="neon-glow-hover shrink-0"
                  >
                    <Send className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  {aiMode === "analyze" && (
                    <>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        variant="outline"
                        className="shrink-0"
                        title={t("upload_file") || "Upload file"}
                      >
                        <Upload className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      {uploadedFile && (
                        <div className="text-xs text-primary bg-primary/10 p-2 rounded flex justify-between items-center">
                          <span>📎 {uploadedFile.name}</span>
                          <button onClick={() => setUploadedFile(null)} className="hover:text-destructive">
                            ✕
                          </button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                {input.trim() === "" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2">
                    {(SUGGESTED_PROMPTS[aiMode] || []).map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(prompt)}
                        className="p-2 md:p-3 rounded-lg border border-border/50 hover:border-primary bg-secondary/20 hover:bg-secondary/40 transition-all text-xs text-left hover:shadow-lg"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  {t("total_available")}: {monthlyCredits + purchasedCredits} {t("credits")}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto mb-2 md:mb-4 space-y-2 md:space-y-4 px-2 md:px-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[90%] md:max-w-[70%] p-2 md:p-4 rounded-lg text-xs md:text-sm group relative ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>

                      {message.role === "assistant" && (
                        <div className="hidden group-hover:flex gap-2 mt-2 pt-2 border-t border-border/50">
                          <button
                            onClick={() => {
                              setSelectedMessageToSave(message.content)
                              setSaveType("task")
                              setShowSaveDialog(true)
                            }}
                            className="text-xs px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 transition"
                            title={t("save_as_task")}
                          >
                            📝 Task
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMessageToSave(message.content)
                              setSaveType("calendar")
                              setShowSaveDialog(true)
                            }}
                            className="text-xs px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 transition"
                            title={t("save_to_calendar")}
                          >
                            📅 Calendar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary/50 p-2 md:p-4 rounded-lg">
                      <div className="flex gap-1 md:gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-1 md:gap-2 px-2 md:px-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("input_placeholder")}
                  className="bg-secondary/50 text-xs md:text-sm"
                  disabled={loading}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={loading || (!input.trim() && !uploadedFile)}
                  className="neon-glow-hover shrink-0"
                >
                  <Send className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                {aiMode === "analyze" && (
                  <>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      variant="outline"
                      className="shrink-0"
                      title={t("upload_file") || "Upload file"}
                    >
                      <Upload className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    {uploadedFile && (
                      <div className="text-xs text-primary bg-primary/10 p-2 rounded flex justify-between items-center">
                        <span>📎 {uploadedFile.name}</span>
                        <button onClick={() => setUploadedFile(null)} className="hover:text-destructive">
                          ✕
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Right Sidebar */}
      {showRightSidebar && (
        <div
          id="mobile-right-sidebar"
          className="fixed md:hidden right-0 top-16 bottom-0 w-64 bg-background border-l border-border/50 p-4 flex flex-col z-50 shadow-lg overflow-hidden"
        >
          <Button onClick={createNewConversation} className="w-full neon-glow-hover">
            <Plus className="w-4 h-4 mr-2" />
            {t("new_conversation")}
          </Button>

          <div className="flex-1 overflow-y-auto space-y-2 border-t border-border/50 pt-4">
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("no_conversations")}</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    loadConversation(conv.id)
                    setShowRightSidebar(false)
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-colors text-sm flex items-center justify-between group overflow-hidden ${
                    currentConversationId === conv.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50"
                  }`}
                >
                  <span className="truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="glass-card max-w-md w-full space-y-4 p-6">
            <h2 className="text-lg font-semibold">
              {t("save_to")} {saveType === "task" ? t("task") : t("calendar")}
            </h2>

            <div>
              <label className="text-sm font-medium">{t("title") || "Title"}</label>
              <Input
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder={t("enter_title") || "Enter title"}
                className="bg-secondary/50 mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (saveType === "task") saveAsTask()
                  else saveToCalendar()
                }}
                className="flex-1"
              >
                {t("save") || "Save"}
              </Button>
              <Button
                onClick={() => {
                  setShowSaveDialog(false)
                  setSelectedMessageToSave(null)
                  setSaveType(null)
                  setSaveTitle("")
                }}
                variant="outline"
                className="flex-1"
              >
                {t("cancel") || "Cancel"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AIPage
