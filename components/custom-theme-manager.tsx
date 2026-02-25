"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit2, Plus } from "lucide-react"

export interface CustomTheme {
  id: string
  name: string
  primary: string
  secondary: string
}

interface CustomThemeManagerProps {
  themes: CustomTheme[]
  onThemeSave: (theme: CustomTheme) => Promise<void>
  onThemeDelete: (themeId: string) => Promise<void>
  onThemeSelect: (theme: CustomTheme) => void
  selectedThemeId?: string
  maxThemes?: number
}

export function CustomThemeManager({
  themes,
  onThemeSave,
  onThemeDelete,
  onThemeSelect,
  selectedThemeId,
  maxThemes = 5,
}: CustomThemeManagerProps) {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CustomTheme>({
    id: "",
    name: "",
    primary: "#a3e635",
    secondary: "#00d4ff",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleCreateNew = () => {
    if (themes.length >= maxThemes) {
      toast({
        title: "error",
        description: `You can only create up to ${maxThemes} custom themes`,
        variant: "destructive",
      })
      return
    }
    setIsCreating(true)
    setEditingId(null)
    setFormData({
      id: `custom-${Date.now()}`,
      name: "",
      primary: "#a3e635",
      secondary: "#00d4ff",
    })
  }

  const handleEdit = (theme: CustomTheme) => {
    setIsCreating(false)
    setEditingId(theme.id)
    setFormData(theme)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "error",
        description: "Theme name is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await onThemeSave(formData)
      setIsCreating(false)
      setEditingId(null)
      toast({
        title: "success",
        description: isCreating ? "Theme created successfully" : "Theme updated successfully",
      })
    } catch (error) {
      toast({
        title: "error",
        description: "Failed to save theme",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (themeId: string) => {
    if (!confirm("Are you sure you want to delete this theme?")) return

    try {
      await onThemeDelete(themeId)
      toast({
        title: "success",
        description: "Theme deleted successfully",
      })
    } catch (error) {
      toast({
        title: "error",
        description: "Failed to delete theme",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Themes ({themes.length}/{maxThemes})</h3>
        {themes.length < maxThemes && !isCreating && !editingId && (
          <Button onClick={handleCreateNew} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Theme
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card className="p-4 border border-primary/30 bg-card/50">
          <div className="space-y-4">
            <div>
              <Label>Theme Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., My Custom Theme"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={formData.primary}
                    onChange={(e) => setFormData({ ...formData, primary: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.primary}
                    onChange={(e) => setFormData({ ...formData, primary: e.target.value })}
                    placeholder="#a3e635"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Secondary Color</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={formData.secondary}
                    onChange={(e) => setFormData({ ...formData, secondary: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.secondary}
                    onChange={(e) => setFormData({ ...formData, secondary: e.target.value })}
                    placeholder="#00d4ff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setEditingId(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? "Saving..." : "Save Theme"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Theme List */}
      <div className="grid gap-3">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={`p-4 cursor-pointer transition-all border ${
              selectedThemeId === theme.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => onThemeSelect(theme)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex gap-1">
                  <div
                    className="w-8 h-8 rounded-lg shadow-md"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg shadow-md"
                    style={{ backgroundColor: theme.secondary }}
                  />
                </div>
                <div>
                  <p className="font-medium">{theme.name}</p>
                  <p className="text-xs text-muted-foreground">{theme.primary} · {theme.secondary}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(theme)
                  }}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(theme.id)
                  }}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {themes.length === 0 && !isCreating && (
        <Card className="p-6 text-center border-border/50">
          <p className="text-muted-foreground mb-3">No custom themes yet</p>
          <Button onClick={handleCreateNew} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Theme
          </Button>
        </Card>
      )}
    </div>
  )
}
