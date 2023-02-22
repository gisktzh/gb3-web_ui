FROM node:18.12-alpine as build-app

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

FROM nginx:1.23-alpine as server
COPY ./.docker/nginx.conf /etc/nginx/conf.d/configfile.template

COPY --from=build-app /app/dist /usr/share/nginx/html

ENV PORT 8080
EXPOSE 8080
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
