FROM node:20.9.0-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /src

COPY package.json package-lock.json ./
RUN npm install

FROM node:20.9.0-alpine AS builder
WORKDIR /src
COPY --from=deps /src/node_modules ./node_modules
COPY . .


FROM node:20.9.0-alpine AS runner
WORKDIR /src

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/package.json ./package.json

EXPOSE 4000