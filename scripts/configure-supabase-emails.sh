#!/bin/bash

# Supabase Email Template Configuration Script
# This script helps configure the email templates in Supabase

# IMPORTANT: You must manually configure these in the Supabase Dashboard
# The Supabase CLI does not support modifying email templates directly

set -e

APP_URL="${1:-https://future-task.com}"

echo "================================================"
echo "Supabase Email Template Configuration"
echo "================================================"
echo ""
echo "App URL: $APP_URL"
echo ""
echo "IMPORTANT: You must do this manually in Supabase Dashboard"
echo "================================================"
echo ""

echo "STEP 1: Go to Supabase Dashboard"
echo "  - Navigate to: Project Settings > Email Templates"
echo ""

echo "STEP 2: Edit 'Confirm Signup' template"
echo "  - Click on the 'Confirm Signup' email template"
echo "  - Find the button or link that says 'Confirm your email'"
echo "  - Edit the href attribute to:"
echo "  → {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup"
echo ""

echo "STEP 3: Edit 'Reset Password' template"
echo "  - Click on the 'Reset Password' email template"
echo "  - Find the button or link that says 'Reset your password'"
echo "  - Edit the href attribute to:"
echo "  → {{ .SiteURL }}/auth/reset?token_hash={{ .TokenHash }}&type=recovery"
echo ""

echo "STEP 4 (Optional): Edit 'Invite' template"
echo "  - Click on the 'Invite' email template"
echo "  - Find the button or link"
echo "  - Edit the href attribute to:"
echo "  → {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite"
echo ""

echo "================================================"
echo "IMPORTANT VARIABLES (leave these AS IS):"
echo "================================================"
echo "{{ .SiteURL }}     - Supabase will replace with your app URL"
echo "{{ .TokenHash }}   - The verification token"
echo "{{ .Email }}       - User's email address"
echo ""

echo "IMPORTANT: When modifying templates:"
echo "✓ Do NOT remove other parts of the template"
echo "✓ Only change the href URL in the button/link"
echo "✓ Keep all other template variables intact"
echo "✓ Click 'Save' after editing each template"
echo ""

echo "After configuring, test by:"
echo "1. Creating a new account at $APP_URL/signup"
echo "2. Check your email for the verification link"
echo "3. Click the link - it should redirect to the confirm page"
echo "4. Then you can log in successfully"

