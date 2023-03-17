FROM node:18-alpine

RUN mkdir -p /app

WORKDIR /app

ADD . /app

RUN npm install

CMD npm run build && npm run start:prod
