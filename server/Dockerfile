FROM node:14.18.1-alpine as build-deps

WORKDIR /usr/src/app

COPY ./package.json ./yarn.lock  ./

RUN yarn

COPY . ./

RUN yarn build

FROM node:14.18.1-alpine

WORKDIR /usr/src/app

COPY --from=build-deps /usr/src/app/build ./build/
COPY --from=build-deps /usr/src/app/package.json ./

RUN yarn install --production=true

CMD ["node", "./build/main.js"]