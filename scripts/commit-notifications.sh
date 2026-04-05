#!/bin/bash
cd /vercel/share/v0-project
git add .
git commit -m "feat: Add push notifications infrastructure with VAPID keys setup"
git push origin HEAD
