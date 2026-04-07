'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { AlertCircle, Zap, ShoppingCart } from '@/components/icons'
import { useTranslation } from '@/hooks/useTranslation'

interface OutOfCreditsModalProps {
  userPlan?: string
  onUpgrade?: () => void
  onBuyCredits?: () => void
}

export function OutOfCreditsModal({ userPlan = 'free', onUpgrade, onBuyCredits }: OutOfCreditsModalProps) {
  const { t } = useTranslation()

  // Mostrar opción de upgrade solo si no tiene plan Pro
  const canUpgradeToPro = userPlan !== 'pro'
  const proPrice = '€6.49'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="glass-card p-8 md:p-12 text-center neon-glow max-w-2xl w-full">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4 md:mb-6">
          <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          <span className="text-orange-500">{t('out_of_credits') || 'Se acabaron tus créditos'}</span>
        </h2>
        
        <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
          {t('out_of_credits_description') || 'Necesitas más créditos para continuar usando el asistente de IA. Puedes:'}
        </p>

        <div className="space-y-4 mb-8">
          {/* Opción 1: Upgrade a Pro */}
          {canUpgradeToPro && (
            <div className="p-4 md:p-6 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-semibold text-sm md:text-base">{t('upgrade_to_pro') || 'Mejora a Plan Pro'}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {t('pro_plan_benefits') || 'Obtén 500 créditos mensuales + acceso a todas las funciones'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Opción 2: Comprar Créditos */}
          <div className="p-4 md:p-6 bg-secondary/10 border border-secondary/30 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <ShoppingCart className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-sm md:text-base">{t('buy_credits') || 'Comprar Créditos'}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {t('buy_credits_anytime') || 'Compra créditos en cualquier momento - nunca caducan'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          {/* Botón Upgrade a Pro */}
          {canUpgradeToPro && (
            <Link href="/app/subscription" className="w-full md:w-auto">
              <Button 
                size="lg" 
                className="neon-glow-hover w-full bg-violet-600 hover:bg-violet-700 text-white"
                onClick={onUpgrade}
              >
                <Zap className="w-4 h-4 mr-2" />
                {t('upgrade_to_pro') || 'Mejora a Pro'} ({proPrice}/mes)
              </Button>
            </Link>
          )}

          {/* Botón Comprar Créditos */}
          <Link href="/app/credits" className="w-full md:w-auto">
            <Button 
              size="lg" 
              className="neon-glow-hover w-full"
              onClick={onBuyCredits}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {t('buy_credits_now') || 'Comprar Créditos'}
            </Button>
          </Link>

          {/* Botón Volver */}
          <Link href="/app" className="w-full md:w-auto">
            <Button size="lg" variant="outline" className="w-full bg-transparent">
              {t('go_back') || 'Volver'}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
