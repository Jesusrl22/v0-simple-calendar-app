"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface BlogPost {
  id: string
  titleKey: string
  descKey: string
  readTimeKey: string
  slug: string
  category: string
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    titleKey: "blogPost1Title",
    descKey: "blogPost1Desc",
    readTimeKey: "blogPost1ReadTime",
    slug: "pomodoro-technique",
    category: "Time Management",
  },
  {
    id: "2",
    titleKey: "blogPost2Title",
    descKey: "blogPost2Desc",
    readTimeKey: "blogPost2ReadTime",
    slug: "study-methods",
    category: "Learning",
  },
  {
    id: "3",
    titleKey: "blogPost3Title",
    descKey: "blogPost3Desc",
    readTimeKey: "blogPost3ReadTime",
    slug: "ai-productivity",
    category: "AI & Automation",
  },
  {
    id: "4",
    titleKey: "blogPost4Title",
    descKey: "blogPost4Desc",
    readTimeKey: "blogPost4ReadTime",
    slug: "task-prioritization",
    category: "Productivity",
  },
  {
    id: "5",
    titleKey: "blogPost5Title",
    descKey: "blogPost5Desc",
    readTimeKey: "blogPost5ReadTime",
    slug: "team-collaboration",
    category: "Teamwork",
  },
  {
    id: "6",
    titleKey: "blogPost6Title",
    descKey: "blogPost6Desc",
    readTimeKey: "blogPost6ReadTime",
    slug: "burnout-prevention",
    category: "Wellness",
  },
]

export function BlogSection() {
  const { t } = useLanguage()

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">{t("blogTitle")}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("blogDesc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Card
              key={post.id}
              className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 h-32 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary uppercase">{post.category}</span>
              </div>
              <div className="flex-1 p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{t(post.titleKey)}</h3>
                <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">{t(post.descKey)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t(post.readTimeKey)}</span>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                      Read More →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/blog">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
