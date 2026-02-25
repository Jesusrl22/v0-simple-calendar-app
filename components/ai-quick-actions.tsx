"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CalendarPlus, ListTodo, BookOpen, Brain, Zap } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/hooks/useTranslation"
import { useToast } from "@/hooks/use-toast"

export function AIQuickActions() {
  const router = useRouter()
  const { t } = useTranslation()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const quickActions = [
    {
      id: "plan-day",
      title: t("plan_my_day"),
      description: t("plan_my_day_description"),
      icon: CalendarPlus,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "prioritize-tasks",
      title: t("prioritize_tasks"),
      description: t("prioritize_tasks_description"),
      icon: ListTodo,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      id: "study-plan",
      title: t("create_study_plan"),
      description: t("create_study_plan_description"),
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      id: "summarize-notes",
      title: t("summarize_notes"),
      description: t("summarize_notes_description"),
      icon: Brain,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]

  const handleQuickAction = async (actionId: string) => {
    setLoading(actionId)

    try {
      const prompts: Record<string, string> = {
        "plan-day":
          "Based on my current tasks, create a detailed schedule for today with time blocks. Include breaks and prioritize by deadline.",
        "prioritize-tasks":
          "Analyze all my tasks and organize them using the Eisenhower Matrix (urgent/important). Suggest which to do first.",
        "study-plan":
          "Create a 7-day study plan based on my notes and tasks. Include review sessions and spaced repetition.",
        "summarize-notes": "Summarize my 5 most recent notes into bullet points with key takeaways.",
      }

      const userLanguage = typeof window !== "undefined" ? localStorage.getItem("language") || "en" : "en"

      // Send to AI chat endpoint
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompts[actionId],
          language: userLanguage,
          mode: "chat",
          systemPrompt: "You are a helpful AI assistant. Provide clear, concise answers.",
        }),
      })

      if (!response.ok) {
        if (response.status === 402) {
          toast({
            title: "Error",
            description: "Insufficient AI credits. Please upgrade your plan.",
            variant: "destructive",
          })
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || "AI action failed")
        }
        setLoading(null)
        return
      }

      const data = await response.json()
      const aiResponse = data.response

      // Save to conversations with UUID
      const conversationId = crypto.randomUUID()
      const messages = [
        { role: "user", content: prompts[actionId] },
        { role: "assistant", content: aiResponse },
      ]

      // Save to database (authentication handled by cookies)
      const saveResponse = await fetch("/api/ai-conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: conversationId,
          title: `${actionId.replace(/-/g, " ")} - ${new Date().toLocaleDateString()}`,
          messages: messages,
          mode: "chat",
        }),
      })

      if (!saveResponse.ok) {
        console.error("[v0] Failed to save conversation:", saveResponse.status)
      }

      // Navigate to AI page with the conversation
      router.push(`/app/ai?conversation=${conversationId}`)
      toast({
        title: "Success",
        description: "AI action completed! Navigating to AI page...",
      })
    } catch (error) {
      console.error("[v0] Quick action error:", error)
      toast({
        title: "Error",
        description: "Failed to complete AI action",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="glass-card border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
          {t("ai_quick_actions_title")}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t("ai_quick_actions_description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className="h-auto p-3 sm:p-4 justify-start bg-transparent hover:bg-muted/50 transition-colors w-full"
            onClick={() => handleQuickAction(action.id)}
            disabled={loading === action.id}
          >
            <div className={`p-2 rounded-lg ${action.bgColor} mr-3 flex-shrink-0`}>
              <action.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${action.color}`} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-sm sm:text-base truncate">{action.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{action.description}</div>
            </div>
            {loading === action.id ? (
              <Zap className="h-4 w-4 animate-spin ml-2 flex-shrink-0 text-purple-500" />
            ) : (
              <Zap className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
            )}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
