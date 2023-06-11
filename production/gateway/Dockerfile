FROM node:18-buster-slim

RUN mkdir -p /app

WORKDIR /app

ADD . /app

RUN npm install

CMD npm run build && npm run start:prod
