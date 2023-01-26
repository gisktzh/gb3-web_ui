FROM node:18.12-alpine as build-app

ARG GB2_API_USER_TOKEN
RUN test -n "$GB2_API_USER_TOKEN"

WORKDIR /app
COPY . .

# Replace the sensitive URL token with the value from the build-arg
RUN mv ./src/environments/environment.local.ts.example ./src/environments/environment.local.ts
RUN sed -i -r "s/replace-me-with-key/${GB2_API_USER_TOKEN}/g" ./src/environments/environment.local.ts

RUN npm ci
RUN npm run build

FROM nginx:1.23-alpine as server
COPY ./.docker/nginx.conf /etc/nginx/conf.d/configfile.template

COPY --from=build-app /app/dist /usr/share/nginx/html

ENV PORT 8080
EXPOSE 8080
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
