FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack install -g pnpm@10.34.8

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV PORT=3000
EXPOSE ${PORT}

CMD ["pnpm", "run", "dev"]
