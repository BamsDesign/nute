#!/usr/bin/env bash
# Build Vercel : client Prisma, puis (si une base est connectée) migrations,
# catalogue de services et compte administrateur initial, enfin build Next.js.
set -euo pipefail

npx prisma generate

if [ -n "${DATABASE_URL:-}" ]; then
  # Les migrations passent par la connexion directe Neon (hors pooler) si elle existe.
  DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" npx prisma migrate deploy
  npx tsx prisma/seed.ts
  if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
    npx tsx scripts/create-admin.ts --if-missing
  fi
else
  echo "DATABASE_URL absent : migrations et données initiales ignorées."
fi

npx next build
