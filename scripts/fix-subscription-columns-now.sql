-- Script definitivo para sincronizar TODAS las columnas de suscripción
-- Este script actualiza todos los usuarios para que subscription_plan, subscription_tier, y plan tengan el mismo valor

-- Step 1: Actualizar todos los usuarios para que las 3 columnas sean iguales
-- Usaremos subscription_tier como fuente de verdad
UPDATE users
SET 
  subscription_plan = COALESCE(LOWER(subscription_tier), 'free'),
  plan = COALESCE(LOWER(subscription_tier), 'free')
WHERE subscription_tier IS NOT NULL;

-- Step 2: Si subscription_tier es NULL, usar subscription_plan como fuente
UPDATE users
SET 
  subscription_tier = COALESCE(LOWER(subscription_plan), 'free'),
  plan = COALESCE(LOWER(subscription_plan), 'free')
WHERE subscription_tier IS NULL AND subscription_plan IS NOT NULL;

-- Step 3: Si ambos son NULL, establecer todo a 'free'
UPDATE users
SET 
  subscription_tier = 'free',
  subscription_plan = 'free',
  plan = 'free'
WHERE subscription_tier IS NULL AND subscription_plan IS NULL;

-- Step 4: Asignar créditos mensuales correctos según el plan
UPDATE users
SET ai_credits_monthly = 0
WHERE LOWER(subscription_tier) = 'free';

UPDATE users
SET ai_credits_monthly = 100
WHERE LOWER(subscription_tier) = 'premium';

UPDATE users
SET ai_credits_monthly = 500
WHERE LOWER(subscription_tier) = 'pro';

-- Step 5: Asegurar que ai_credits_purchased no sea NULL
UPDATE users
SET ai_credits_purchased = 0
WHERE ai_credits_purchased IS NULL;

-- Step 6: Verificar resultados
SELECT 
  email,
  subscription_tier,
  subscription_plan,
  plan,
  ai_credits_monthly,
  ai_credits_purchased,
  subscription_expires_at
FROM users
ORDER BY created_at DESC;
