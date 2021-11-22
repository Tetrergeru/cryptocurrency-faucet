FROM node:14.18.1-alpine as build-deps
WORKDIR /usr/src/app
COPY ./package.json ./yarn.lock  ./
RUN yarn
COPY . ./
RUN yarn build

FROM nginx:1.21.3-alpine
COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]