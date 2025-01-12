
FROM node:18-buster

ENV NODE_ENV=production
ENV PORT=8000
ENV SECRET_MESSAGE=haha
ENV MONGODB_PORT=27017
ENV MONGODB_HOST=localhost
ENV MONGODB_DATABASE=cash-flow

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install -g typescript

COPY . .

RUN tsc

EXPOSE 3000

CMD ["node", "build/index.js"]
