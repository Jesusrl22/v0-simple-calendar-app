"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ExternalLink, Edit } from "@/components/icons"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { canAccessFeature } from "@/lib/subscription"
import { UpgradeModal } from "@/components/upgrade-modal"
import { useTranslation } from "@/hooks/useTranslation"

export default function WishlistPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [filter, setFilter] = useState("all")
  const [itemForm, setItemForm] = useState({
    title: "",
    description: "",
    price: "",
    priority: "medium",
    url: "",
  })
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

        if (canAccessFeature(data.subscription_tier, "wishlist")) {
          fetchItems()
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/wishlist")
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      setItems([])
    }
  }

  const handleSaveItem = async () => {
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: itemForm.title,
          description: itemForm.description,
          price: itemForm.price ? Number.parseFloat(itemForm.price) : null,
          priority: itemForm.priority,
          url: itemForm.url,
        }),
      })

      setItemForm({ title: "", description: "", price: "", priority: "medium", url: "" })
      setIsDialogOpen(false)
      fetchItems()
    } catch (error) {
      console.error("Error saving wishlist item:", error)
    }
  }

  const handleEditItem = async () => {
    try {
      await fetch("/api/wishlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          title: editingItem.title,
          description: editingItem.description,
          price: editingItem.price ? Number.parseFloat(editingItem.price) : null,
          priority: editingItem.priority,
          url: editingItem.url,
        }),
      })

      setIsEditDialogOpen(false)
      setEditingItem(null)
      fetchItems()
    } catch (error) {
      console.error("Error updating wishlist item:", error)
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      await fetch(`/api/wishlist?id=${itemId}`, {
        method: "DELETE",
      })
      fetchItems()
    } catch (error) {
      console.error("Error deleting wishlist item:", error)
    }
  }

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true
    return item.priority === filter
  })

  const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p>{t("loading")}</p>
      </div>
    )
  }

  if (!canAccessFeature(subscriptionTier, "wishlist")) {
    return <UpgradeModal feature={t("wishlist")} requiredPlan="premium" />
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold hidden md:block">
          <span className="text-primary neon-text">{t("wishlist")}</span>
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="neon-glow-hover">
              <Plus className="w-4 h-4 mr-2" />
              {t("add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{t("addWish")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("title")}</Label>
                <Input
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  placeholder={t("wishTitle")}
                  className="bg-secondary/50"
                />
              </div>
              <div>
                <Label>{t("description")}</Label>
                <Textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder={t("wishDescription")}
                  className="bg-secondary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("price")}</Label>
                  <Input
                    type="number"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    placeholder="0.00"
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <Label>{t("priority")}</Label>
                  <Select
                    value={itemForm.priority}
                    onValueChange={(value) => setItemForm({ ...itemForm, priority: value })}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("priority_low")}</SelectItem>
                      <SelectItem value="medium">{t("priority_medium")}</SelectItem>
                      <SelectItem value="high">{t("priority_high")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t("url")}</Label>
                <Input
                  value={itemForm.url}
                  onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                  placeholder="https://..."
                  className="bg-secondary/50"
                />
              </div>
              <Button onClick={handleSaveItem} className="w-full neon-glow-hover">
                {t("add")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>{t("editWish")}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>{t("title")}</Label>
                <Input
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder={t("wishTitle")}
                  className="bg-secondary/50"
                />
              </div>
              <div>
                <Label>{t("description")}</Label>
                <Textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder={t("wishDescription")}
                  className="bg-secondary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("price")}</Label>
                  <Input
                    type="number"
                    value={editingItem.price || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                    placeholder="0.00"
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <Label>{t("priority")}</Label>
                  <Select
                    value={editingItem.priority}
                    onValueChange={(value) => setEditingItem({ ...editingItem, priority: value })}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("priority_low")}</SelectItem>
                      <SelectItem value="medium">{t("priority_medium")}</SelectItem>
                      <SelectItem value="high">{t("priority_high")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t("url")}</Label>
                <Input
                  value={editingItem.url || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="https://..."
                  className="bg-secondary/50"
                />
              </div>
              <Button onClick={handleEditItem} className="w-full neon-glow-hover">
                {t("save")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card p-6 neon-glow-hover">
          <h3 className="text-sm text-muted-foreground mb-2">{t("all_tasks")}</h3>
          <p className="text-3xl font-bold">{items.length}</p>
        </Card>
        <Card className="glass-card p-6 neon-glow-hover">
          <h3 className="text-sm text-muted-foreground mb-2">{t("total_value")}</h3>
          <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
        </Card>
        <Card className="glass-card p-6 neon-glow-hover">
          <h3 className="text-sm text-muted-foreground mb-2">
            {t("priority_high")}
          </h3>
          <p className="text-3xl font-bold">{items.filter((i) => i.priority === "high").length}</p>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{t("all_tasks")}</TabsTrigger>
          <TabsTrigger value="high">
            {t("priority_high")}
          </TabsTrigger>
          <TabsTrigger value="medium">
            {t("priority_medium")}
          </TabsTrigger>
          <TabsTrigger value="low">
            {t("priority_low")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id}>
              <Card className="glass-card p-6 neon-glow-hover transition-all duration-300 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex-1">{item.description}</p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    {item.price && <span className="text-lg font-bold text-primary">${item.price}</span>}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(item)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {filteredItems.length === 0 && (
        <Card className="glass-card p-12 text-center">
          <p className="text-muted-foreground">{t("no_tasks_found")}</p>
        </Card>
      )}
    </div>
  )
}
