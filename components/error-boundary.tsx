"use client"

import React, { ReactNode, ErrorInfo } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error but suppress "No group found" warnings
    if (!error.message?.includes("No group found")) {
      console.error("[ErrorBoundary] Caught error:", error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError && this.state.error?.message?.includes("No group found")) {
      // Silently recover from group not found errors
      return <>{this.props.children}</>
    }

    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5">
          <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
          <p className="text-sm text-foreground/70">{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}
