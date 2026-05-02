FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_KAKAO_LOGIN_PATH=/kakao-authentication/request-oauth-link
ARG NEXT_PUBLIC_KAKAO_JS_KEY=""
ARG NEXT_PUBLIC_SHARE_BASE_URL=""
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_KAKAO_LOGIN_PATH=$NEXT_PUBLIC_KAKAO_LOGIN_PATH
ENV NEXT_PUBLIC_KAKAO_JS_KEY=$NEXT_PUBLIC_KAKAO_JS_KEY
ENV NEXT_PUBLIC_SHARE_BASE_URL=$NEXT_PUBLIC_SHARE_BASE_URL

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
