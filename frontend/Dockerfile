FROM node:20-alpine 

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --quiet

COPY . .

ENV NODE_ENV=production

CMD ["npm", "run", "build"]