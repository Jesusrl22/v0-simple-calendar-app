'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface PayPalButtonProps {
  hostedButtonId: string
  containerId: string
  label?: string
  disabled?: boolean
}

export function PayPalButton({
  hostedButtonId,
  containerId,
  label = 'Buy Now',
  disabled = false,
}: PayPalButtonProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load PayPal SDK
    if (isLoaded || (window as any).paypal) return

    const script = document.createElement('script')
    script.src =
      'https://www.paypal.com/sdk/js?client-id=BAAErLK9a7MDpL4R4B5toQTZkuLtYDBqH6UDdxyDRd0PK9MMUvBqgyCP-OwyP1RZ3RBprQ2m7zWab8rr0Y&components=hosted-buttons&disable-funding=venmo&currency=EUR'
    script.async = true

    script.onload = () => {
      try {
        ;(window as any).paypal.HostedButtons({
          hostedButtonId,
        }).render(`#${containerId}`)
        setIsLoaded(true)
      } catch (err) {
        setError('Failed to load PayPal button')
        console.error('PayPal error:', err)
      }
    }

    script.onerror = () => {
      setError('Failed to load PayPal SDK')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
    }
  }, [hostedButtonId, containerId, isLoaded])

  if (error) {
    return (
      <Button disabled variant="destructive" className="w-full">
        {error}
      </Button>
    )
  }

  if (!isLoaded) {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    )
  }

  return <div id={containerId} />
}
