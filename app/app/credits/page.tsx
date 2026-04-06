'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { Zap, Check } from 'lucide-react'

export default function CreditsPage() {
  const { t } = useTranslation()
  const [paypalLoaded, setPaypalLoaded] = useState(false)

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement('script')
    script.src = 'https://www.paypal.com/sdk/js?client-id=BAAErLK9a7MDpL4R4B5toQTZkuLtYDBqH6UDdxyDRd0PK9MMUvBqgyCP-OwyP1RZ3RBprQ2m7zWab8rr0Y&components=hosted-buttons&disable-funding=venmo&currency=EUR'
    script.async = true
    script.onload = () => setPaypalLoaded(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (paypalLoaded && (window as any).paypal) {
      ;(window as any).paypal.HostedButtons({
        hostedButtonId: 'FKYSPKYRC38FN',
      }).render('#paypal-container-FKYSPKYRC38FN')
    }
  }, [paypalLoaded])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('credits') || 'Credits'}</h1>
          <p className="text-lg text-muted-foreground">
            {t('buyCreditsDescription') || 'Purchase AI credits to unlock premium features'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {/* Free Plan */}
          <Card className="p-8 relative bg-transparent border border-border">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{t('free') || 'Free'}</h3>
              <p className="text-muted-foreground">For getting started</p>
            </div>
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2">100</div>
              <p className="text-muted-foreground">{t('credits') || 'Credits'}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {['Basic AI features', 'Limited daily usage', 'Community support'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button disabled className="w-full">
              {t('included') || 'Included'}
            </Button>
          </Card>

          {/* Popular Plan - 2000 Credits */}
          <Card className="p-8 relative bg-transparent border-primary border-2 shadow-lg">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                {t('popular') || 'POPULAR'}
              </span>
            </div>
            <div className="mb-6 pt-4">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                {t('pro') || 'Pro'}
              </h3>
              <p className="text-muted-foreground">Recommended for power users</p>
            </div>
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2">2000</div>
              <p className="text-muted-foreground">{t('credits') || 'Credits'}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Advanced AI features',
                'Unlimited daily usage',
                'Priority support',
                'Advanced analytics',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            {/* PayPal Button */}
            <div id="paypal-container-FKYSPKYRC38FN"></div>
            {!paypalLoaded && (
              <Button disabled className="w-full">
                {t('loading') || 'Loading...'}
              </Button>
            )}
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-8 relative bg-transparent border border-border">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{t('enterprise') || 'Enterprise'}</h3>
              <p className="text-muted-foreground">For organizations</p>
            </div>
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2">{t('custom') || 'Custom'}</div>
              <p className="text-muted-foreground">{t('contactSales') || 'Contact sales'}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited credits',
                'Dedicated support',
                'Custom integrations',
                'SLA guarantee',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full">
              {t('contactUs') || 'Contact Us'}
            </Button>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">What you get with credits?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'AI Generations',
                  description: 'Generate AI content, images, and more',
                },
                {
                  title: 'Priority Processing',
                  description: 'Faster processing for your requests',
                },
                {
                  title: '30-Day Expiry',
                  description: 'Credits valid for 30 days from purchase',
                },
                {
                  title: 'No Limits',
                  description: 'Use your credits anytime, anywhere',
                },
              ].map((feature, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
