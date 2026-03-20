#
# Build the SPA (Next.js export) and serve it via nginx.
#
# This image is designed to be run multiple times (one container per instance).
#

FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Avoid Next.js telemetry prompts/noise during CI builds.
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies first for better build caching.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the repo and build the static export into /app/out.
COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/out/ /usr/share/nginx/html/

# Support serving the app both at "/" and at "/RED-Alert/" (if the build references that base path).
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

