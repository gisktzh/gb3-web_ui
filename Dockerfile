FROM node:18.15-alpine as build-app

ARG TARGET_ENVIRONMENT=local

WORKDIR /app
COPY . .

RUN npm ci --omit=dev
RUN npm run build-$TARGET_ENVIRONMENT

FROM nginx:1.25-alpine as server
COPY ./.docker/nginx.conf /etc/nginx/conf.d/configfile.template

COPY --from=build-app /app/dist /usr/share/nginx/html

ENV PORT 8080
EXPOSE 8080
CMD sh -c "rm -f /var/log/nginx/* && envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
