'use client'

import React from 'react'

interface PayPalButtonProps {
  paymentId: string
  buttonText?: string
  credits: number
}

export function PayPalButton({ paymentId, buttonText = 'Comprar ahora', credits }: PayPalButtonProps) {
  return (
    <form 
      action={`https://www.paypal.com/ncp/payment/${paymentId}`} 
      method="post" 
      target="_blank"
      className="flex flex-col items-center gap-2 w-full"
    >
      <input 
        type="submit" 
        value={buttonText}
        className="px-8 py-2.5 rounded font-bold bg-[#FFD140] text-black hover:bg-[#FFC814] transition-colors cursor-pointer text-base w-full max-w-xs border-none"
      />
      <img 
        src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" 
        alt="payment methods"
        className="h-5"
      />
      <div className="text-xs text-center whitespace-nowrap">
        <span>Tecnología de </span>
        <img 
          src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
          alt="paypal" 
          className="h-3 inline align-middle ml-0.5"
        />
      </div>
    </form>
  )
}
