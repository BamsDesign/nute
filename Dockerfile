# ── Dépendances ────────────────────────────────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ── Migrations / scripts (prisma CLI, seed, création admin) ───
FROM deps AS tools
COPY tsconfig.json ./
COPY scripts ./scripts
CMD ["npx", "prisma", "migrate", "deploy"]

# ── Build ──────────────────────────────────────────────────────
FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# ADMIN_PATH est inliné à la compilation : il doit être fourni au build.
ARG ADMIN_PATH=espace-nute
ARG SITE_URL=https://www.nuteservices.com
ENV ADMIN_PATH=$ADMIN_PATH SITE_URL=$SITE_URL NEXT_OUTPUT_STANDALONE=1
RUN npx prisma generate && npx next build

# ── Exécution ──────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/* \
  && groupadd -r nute && useradd -r -g nute nute && mkdir -p /data/uploads && chown nute:nute /data/uploads
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 UPLOAD_DIR=/data/uploads
COPY --from=builder --chown=nute:nute /app/.next/standalone ./
COPY --from=builder --chown=nute:nute /app/.next/static ./.next/static
USER nute
EXPOSE 3000
VOLUME ["/data/uploads"]
CMD ["node", "server.js"]
