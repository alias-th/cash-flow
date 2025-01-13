
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install -g typescript

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "build/index.js"]
