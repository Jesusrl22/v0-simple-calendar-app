#!/bin/bash

# Force revalidation of the teams page
curl -X POST https://future-task.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"path": "/app/teams"}'

echo "Revalidation triggered for /app/teams"
