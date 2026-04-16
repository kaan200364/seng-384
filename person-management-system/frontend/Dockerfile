FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY public ./public
COPY server.js ./server.js

EXPOSE 3000

CMD ["npm", "start"]