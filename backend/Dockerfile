FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci

ENV NODE_ENV=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && (npm run seed || echo 'Seed skipped/failed') && if [ -f dist/main.js ]; then ls -la dist/ && node dist/main.js; else echo 'dist/main.js not found' && npx nest start; fi"]
