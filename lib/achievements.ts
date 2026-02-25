export type AchievementTier = "free" | "premium" | "pro"

export interface Achievement {
  id: string
  title: string
  description: string
  requirement: number
  icon: string
  tier: AchievementTier
}

export const achievementsList: Achievement[] = [
  // FREE TIER ACHIEVEMENTS
  {
    id: "first_task",
    title: "First Steps",
    description: "Complete your first task",
    requirement: 1,
    icon: "🎯",
    tier: "free",
  },
  {
    id: "task_starter",
    title: "Task Starter",
    description: "Complete 10 tasks",
    requirement: 10,
    icon: "✅",
    tier: "free",
  },
  {
    id: "focus_beginner",
    title: "Focus Beginner",
    description: "Complete 5 Pomodoro sessions",
    requirement: 5,
    icon: "⏱️",
    tier: "free",
  },
  {
    id: "early_bird",
    title: "Early Bird",
    description: "Complete a task before 8 AM",
    requirement: 1,
    icon: "🌅",
    tier: "free",
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Complete a task after 10 PM",
    requirement: 1,
    icon: "🦉",
    tier: "free",
  },

  // PREMIUM TIER ACHIEVEMENTS
  {
    id: "task_master",
    title: "Task Master",
    description: "Complete 50 tasks",
    requirement: 50,
    icon: "🏆",
    tier: "premium",
  },
  {
    id: "note_taker",
    title: "Note Taker",
    description: "Create 10 notes",
    requirement: 10,
    icon: "📝",
    tier: "premium",
  },
  {
    id: "focus_warrior",
    title: "Focus Warrior",
    description: "Complete 25 Pomodoro sessions",
    requirement: 25,
    icon: "💪",
    tier: "premium",
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "7 day streak",
    requirement: 7,
    icon: "🔥",
    tier: "premium",
  },
  {
    id: "wishlist_master",
    title: "Wishlist Master",
    description: "Add 20 items to wishlist",
    requirement: 20,
    icon: "⭐",
    tier: "premium",
  },

  // PRO TIER ACHIEVEMENTS
  {
    id: "task_legend",
    title: "Task Legend",
    description: "Complete 100 tasks",
    requirement: 100,
    icon: "👑",
    tier: "pro",
  },
  {
    id: "focus_master",
    title: "Focus Master",
    description: "Complete 100 Pomodoro sessions",
    requirement: 100,
    icon: "🎯",
    tier: "pro",
  },
  {
    id: "streak_30",
    title: "Month Master",
    description: "30 day streak",
    requirement: 30,
    icon: "💎",
    tier: "pro",
  },
  {
    id: "ai_expert",
    title: "AI Expert",
    description: "Use AI Assistant 50 times",
    requirement: 50,
    icon: "🤖",
    tier: "pro",
  },
  {
    id: "productivity_god",
    title: "Productivity God",
    description: "Complete 500 tasks",
    requirement: 500,
    icon: "⚡",
    tier: "pro",
  },
]

export function getAvailableAchievements(userTier: AchievementTier | null): Achievement[] {
  const tier = (userTier || "free").toLowerCase() as AchievementTier

  if (tier === "pro") {
    return achievementsList // Pro gets all achievements
  } else if (tier === "premium") {
    return achievementsList.filter((a) => a.tier === "free" || a.tier === "premium")
  } else {
    return achievementsList.filter((a) => a.tier === "free")
  }
}
