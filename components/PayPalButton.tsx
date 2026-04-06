'use client'

import React from 'react'

interface PayPalButtonProps {
  paymentId: string
  buttonText?: string
  credits: number
}

export function PayPalButton({ paymentId, buttonText = 'Comprar ahora', credits }: PayPalButtonProps) {
  return (
    <div className="flex justify-center w-full">
      <form 
        action={`https://www.paypal.com/ncp/payment/${paymentId}`} 
        method="post" 
        target="_blank"
        className="inline-grid justify-items-center gap-2 w-full"
      >
        <input 
          type="submit" 
          value={buttonText}
          className="px-8 py-2.5 rounded font-bold bg-[#FFD140] text-black hover:bg-[#FFC814] transition-colors cursor-pointer min-w-[186px] text-base w-full"
        />
        <img 
          src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" 
          alt="cards"
          className="h-6"
        />
        <section className="text-xs text-center">
          Tecnología de{' '}
          <img 
            src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
            alt="paypal" 
            className="h-3.5 inline align-middle ml-1"
          />
        </section>
      </form>
    </div>
  )
}
