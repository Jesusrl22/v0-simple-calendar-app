import { Suspense } from 'react'
import BlogPageClient from './BlogPageClient'
import { Loader2 } from 'lucide-react'

function BlogLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading blogs...</p>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Blogs | Future Task',
  description: 'Master productivity with in-depth guides, strategies, and practical tips for task management, habits, focus, and team collaboration.',
  keywords: ['productivity blogs', 'task management', 'habits', 'focus techniques', 'time management', 'deep work'],
  openGraph: {
    title: 'Blogs | Future Task',
    description: 'Master productivity with in-depth guides and strategies',
    type: 'website',
  },
}

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogLoading />}>
      <BlogPageClient />
    </Suspense>
  )
}
