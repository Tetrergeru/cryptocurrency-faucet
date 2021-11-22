FROM node:14.18.1-alpine as build-deps

WORKDIR /usr/src/app

COPY ./package.json ./yarn.lock  ./

RUN yarn install --production=true

COPY . ./

CMD ["yarn", "start"]