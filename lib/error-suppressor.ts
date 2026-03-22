// Global error handler for suppressing benign console errors
if (typeof window !== "undefined") {
  const originalError = console.error
  const originalWarn = console.warn

  // Suppress "No group found" errors - these are benign React Query errors
  console.error = function (...args: any[]) {
    const message = args[0]?.toString?.() || ""
    if (message.includes("No group found") || message.includes("_R_")) {
      return // Silently ignore
    }
    originalError.apply(console, args)
  }

  // Also suppress in warnings
  console.warn = function (...args: any[]) {
    const message = args[0]?.toString?.() || ""
    if (message.includes("No group found") || message.includes("_R_")) {
      return // Silently ignore
    }
    originalWarn.apply(console, args)
  }
}

export {}
