"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Trash2, Edit2, FileText } from "@/components/icons"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { canAccessFeature } from "@/lib/subscription"
import { UpgradeModal } from "@/components/upgrade-modal"
import { useTranslation } from "@/hooks/useTranslation"
import { SectionHeader } from "@/components/section-header"

export default function NotesPage() {
  const { t } = useTranslation()
  const [notes, setNotes] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)
  const [noteForm, setNoteForm] = useState({ title: "", content: "" })
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSubscriptionAndFetch()
  }, [])

  const checkSubscriptionAndFetch = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setSubscriptionTier(data.subscription_tier || "free")

        if (canAccessFeature(data.subscription_tier, "notes")) {
          fetchNotes()
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes")
      const data = await response.json()
      setNotes(data.notes || [])
    } catch (error) {
      console.error("Error fetching notes:", error)
      setNotes([])
    }
  }

  const handleSaveNote = async () => {
    try {
      if (editingNote) {
        await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingNote.id,
            title: noteForm.title,
            content: noteForm.content,
          }),
        })
      } else {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noteForm.title,
            content: noteForm.content,
          }),
        })
      }

      setNoteForm({ title: "", content: "" })
      setEditingNote(null)
      setIsDialogOpen(false)
      fetchNotes()
    } catch (error) {
      console.error("Error saving note:", error)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/notes?id=${noteId}`, {
        method: "DELETE",
      })
      fetchNotes()
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p>{t("notes_loading")}</p>
      </div>
    )
  }

  if (!canAccessFeature(subscriptionTier, "notes")) {
    return <UpgradeModal feature={t("notes")} requiredPlan="premium" />
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <SectionHeader
        title={t("notes")}
        subtitle={t("organize_notes")}
        icon={FileText}
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-lg shadow-primary/30 w-full md:w-auto"
                onClick={() => {
                  setEditingNote(null)
                  setNoteForm({ title: "", content: "" })
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("notes_new_note")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border border-border/50">
              <DialogHeader>
                <DialogTitle>{editingNote ? t("notes_edit_note") : t("notes_create_note")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder={t("notes_title_placeholder")}
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="bg-secondary/50 border-border/50"
                />
                <Textarea
                  placeholder={t("notes_content_placeholder")}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="bg-secondary/50 min-h-[200px] border-border/50"
                />
                <Button onClick={handleSaveNote} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {editingNote ? t("notes_update_note") : t("notes_create_note")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="bg-card border border-border/50 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("notes_search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div key={note.id}>
            <Card className="bg-card border border-border/50 p-6 hover:border-primary/50 transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:shadow-primary/20">
              <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
              <p className="text-sm text-muted-foreground flex-1 line-clamp-4">{note.content}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <span className="text-xs text-muted-foreground">{new Date(note.updated_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingNote(note)
                      setNoteForm({ title: note.title, content: note.content })
                      setIsDialogOpen(true)
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card className="glass-card p-12 text-center">
          <p className="text-muted-foreground">{t("notes_no_notes_found")}</p>
        </Card>
      )}
    </div>
  )
}
