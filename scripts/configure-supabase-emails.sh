#!/bin/bash

# Supabase Email Template Configuration Script
# This script helps configure the email templates in Supabase

# Make sure you have the Supabase CLI installed:
# npm install -g supabase

# Set your project ID
PROJECT_ID="your-project-id"
API_URL="your-supabase-url"
APP_URL="https://yourdomain.com"

echo "Configuring Supabase Email Templates..."
echo "Project ID: $PROJECT_ID"
echo "App URL: $APP_URL"

# Confirm Email Template
# Supabase will call: {{ .ConfirmationURL }}
# We need to extract the token and language, then redirect to our confirm page

echo ""
echo "✓ Confirm Email Template:"
echo "  - URL: $APP_URL/auth/confirm"
echo "  - Parameters: token (from Supabase), lang (user language)"
echo "  - Configuration: Add custom redirect URL in Supabase Auth settings"

# Reset Password Template
# Supabase will call: {{ .ResetURL }}
# We need to extract the token and language, then redirect to our reset page

echo ""
echo "✓ Reset Password Template:"
echo "  - URL: $APP_URL/auth/reset"
echo "  - Parameters: token (from Supabase), lang (user language)"
echo "  - Configuration: Add custom redirect URL in Supabase Auth settings"

echo ""
echo "IMPORTANT: Configure these in Supabase Dashboard:"
echo "1. Go to Project Settings → Email Templates"
echo "2. For Confirm Email:"
echo "   - Edit the template"
echo "   - Set redirect URL to: $APP_URL/auth/confirm?token={{ .Token }}&lang={{ .UserLanguage }}"
echo "   - The {{ .UserLanguage }} will need custom setup in your DB"
echo ""
echo "3. For Reset Password:"
echo "   - Edit the template"
echo "   - Set redirect URL to: $APP_URL/auth/reset?token={{ .Token }}&lang={{ .UserLanguage }}"
echo ""
echo "4. OR use Supabase custom SMTP:"
echo "   - Send emails through your own provider with custom templates"
echo ""
echo "NOTE: To pass the language to Supabase, store it in user metadata during signup:"
echo "  user_metadata: { language: 'es', name: 'John Doe' }"
