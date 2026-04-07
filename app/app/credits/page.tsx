'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { Zap, Check } from 'lucide-react'
import { PayPalButton } from '@/components/PayPalButton'

export default function CreditsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('credits') || 'Credits'}</h1>
          <p className="text-lg text-muted-foreground">
            {t('buyCreditsDescription') || 'Purchase AI credits to unlock premium features'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-12">
          {/* Starter Plan - 500 Credits */}
          <Card className="p-8 relative bg-transparent border border-border">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground">€2.99</p>
            </div>
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2">500</div>
              <p className="text-muted-foreground">{t('credits') || 'Credits'}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {['Credits nunca caducan', 'Úsalos cuando quieras', 'Se acumulan con créditos mensuales'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <PayPalButton 
              paymentId="XK5L52EZRXAVN"
              buttonText={t('buyNow') || 'Comprar ahora'}
              credits={500}
            />
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
                Popular
              </h3>
              <p className="text-muted-foreground">€9.99</p>
            </div>
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2">2000</div>
              <p className="text-muted-foreground">{t('credits') || 'Credits'}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {['Credits nunca caducan', 'Úsalos cuando quieras', 'Se acumulan con créditos mensuales'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            
            <PayPalButton 
              paymentId="FKYSPKYRC38FN"
              buttonText={t('buyNow') || 'Comprar ahora'}
              credits={2000}
            />
          </Card>

          {/* Professional Plan - 5000 Credits */}
          <Card className="p-8 relative bg-transparent border border-border">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <p className="text-muted-foreground">€17.99</p>
            </div>
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2">5000</div>
              <p className="text-muted-foreground">{t('credits') || 'Credits'}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {['Credits nunca caducan', 'Úsalos cuando quieras', 'Se acumulan con créditos mensuales'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            
            <PayPalButton 
              paymentId="TCQA8RU8R9KVQ"
              buttonText={t('buyNow') || 'Comprar ahora'}
              credits={5000}
            />
          </Card>

          {/* Enterprise Plan - 12000 Credits */}
          <Card className="p-8 relative bg-transparent border border-border">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground">€39.99</p>
            </div>
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2">12000</div>
              <p className="text-muted-foreground">{t('credits') || 'Credits'}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {['Credits nunca caducan', 'Úsalos cuando quieras', 'Se acumulan con créditos mensuales'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            
            <PayPalButton 
              paymentId="6Y2M54NWMFMPW"
              buttonText={t('buyNow') || 'Comprar ahora'}
              credits={12000}
            />
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">¿Qué obtienes con los créditos?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Generaciones de IA',
                  description: 'Genera contenido de IA, imágenes y más con tus créditos',
                },
                {
                  title: 'Procesamiento Prioritario',
                  description: 'Procesamiento más rápido para tus solicitudes',
                },
                {
                  title: 'Sin Expiración',
                  description: 'Los créditos nunca caducan - úsalos cuando quieras',
                },
                {
                  title: 'Sin Límites de Uso',
                  description: 'Usa tus créditos en cualquier momento y lugar',
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
