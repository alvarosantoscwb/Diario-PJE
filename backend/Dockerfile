FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci

ENV NODE_ENV=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && (npm run seed || echo 'Seed skipped/failed') && node dist/main.js"]
