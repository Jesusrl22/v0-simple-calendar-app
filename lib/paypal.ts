export const CREDIT_PACKS = [
  {
    id: "pack_starter",
    name: "Starter",
    credits: 500,
    price: 2.99,
    priceWithVAT: 2.99, // Price already includes VAT
    discount: 0,
    popular: false,
  },
  {
    id: "pack_popular",
    name: "Popular",
    credits: 2000,
    price: 9.99,
    priceWithVAT: 9.99, // Price already includes VAT
    discount: 0,
    popular: true,
  },
  {
    id: "pack_professional",
    name: "Professional",
    credits: 5000,
    price: 17.99,
    priceWithVAT: 17.99, // Price already includes VAT
    discount: 0,
    popular: false,
  },
  {
    id: "pack_enterprise",
    name: "Enterprise",
    credits: 12000,
    price: 39.99,
    priceWithVAT: 39.99, // Price already includes VAT
    discount: 0,
    popular: false,
  },
]

export const SUBSCRIPTION_PLANS = {
  premium: {
    price: 4.99,
    priceWithVAT: 6.04,
    planId: process.env.PAYPAL_PREMIUM_PLAN_ID || "",
  },
  pro: {
    price: 9.99,
    priceWithVAT: 12.09,
    planId: process.env.PAYPAL_PRO_PLAN_ID || "",
  },
}

// PayPal API configuration
const PAYPAL_API_BASE =
  process.env.PAYPAL_ENVIRONMENT === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET

// Get PayPal access token
export async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials are not configured")
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()
  return data.access_token
}

// Create PayPal order for credit packs
export async function createPayPalOrder(packId: string, userId: string) {
  const pack = CREDIT_PACKS.find((p) => p.id === packId)
  if (!pack) throw new Error("Invalid pack")

  const accessToken = await getPayPalAccessToken()

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: pack.priceWithVAT.toFixed(2),
          },
          description: `${pack.credits} AI Credits`,
          custom_id: JSON.stringify({ userId, packId, type: "credits" }),
        },
      ],
      application_context: {
        brand_name: "Future Task",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/subscription?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/subscription?canceled=true`,
      },
    }),
  })

  const data = await response.json()
  return data
}

// Create PayPal subscription
export async function createPayPalSubscription(plan: "premium" | "pro", userId: string) {
  const planConfig = SUBSCRIPTION_PLANS[plan]
  if (!planConfig.planId) throw new Error("PayPal plan not configured")

  const accessToken = await getPayPalAccessToken()

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      plan_id: planConfig.planId,
      subscriber: {
        name: {
          given_name: "User",
        },
      },
      application_context: {
        brand_name: "Future Task",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/subscription?success=true&plan=${plan}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/subscription?canceled=true`,
      },
      custom_id: JSON.stringify({ userId, type: "subscription", plan }),
    }),
  })

  const data = await response.json()
  return data
}

// Capture PayPal order
export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken()

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await response.json()
  return data
}
