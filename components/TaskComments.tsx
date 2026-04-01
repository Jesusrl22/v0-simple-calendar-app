"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Trash2 } from "@/components/icons"

interface Comment {
  id: string
  comment: string
  created_at: string
  user_id: string
  user: { name: string | null; email: string } | null
}

interface TaskCommentsProps {
  taskId: string
  teamId: string
  currentUserId: string
}

export function TaskComments({ taskId, teamId, currentUserId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchComments()
  }, [taskId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [comments])

  async function fetchComments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/task-comments?taskId=${taskId}&teamId=${teamId}`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch (err) {
      console.error("[v0] TaskComments fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/task-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, teamId, comment: text }),
      })
      const data = await res.json()
      if (data.comment) {
        setComments((prev) => [...prev, data.comment])
        setText("")
      }
    } catch (err) {
      console.error("[v0] TaskComments submit error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await fetch("/api/task-comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      })
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      console.error("[v0] TaskComments delete error:", err)
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
  }

  function getInitials(name: string | null, email: string) {
    if (name) return name.slice(0, 2).toUpperCase()
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MessageSquare className="w-4 h-4" />
        <span>Comentarios ({comments.length})</span>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Cargando comentarios...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Sin comentarios aun. Se el primero en comentar.
          </p>
        ) : (
          comments.map((c) => {
            const displayName = c.user?.name || c.user?.email || "Usuario"
            const isOwn = c.user_id === currentUserId
            return (
              <div
                key={c.id}
                className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-primary/20 text-primary border border-primary/30"
                  title={displayName}
                >
                  {getInitials(c.user?.name ?? null, c.user?.email ?? "")}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col gap-0.5 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-3 py-2 rounded-xl text-xs leading-relaxed break-words ${
                      isOwn
                        ? "bg-primary/20 text-foreground border border-primary/30"
                        : "bg-muted/60 text-foreground border border-border"
                    }`}
                  >
                    {!isOwn && (
                      <p className="font-semibold text-primary text-[10px] mb-1">{displayName}</p>
                    )}
                    {c.comment}
                  </div>
                  <div className={`flex items-center gap-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                    <span className="text-[10px] text-muted-foreground">{formatTime(c.created_at)}</span>
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                        title="Eliminar comentario"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          className="min-h-[60px] max-h-24 resize-none text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as any)
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 shrink-0"
          disabled={!text.trim() || submitting}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
