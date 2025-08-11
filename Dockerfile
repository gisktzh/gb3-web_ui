FROM node:22.18-alpine AS build-app

# Provide overrides for APP_VERSION and APP_RELEASE as build-args and expose them as ENV variables for the update-version.js script
ARG APP_VERSION
ARG APP_RELEASE
ENV APP_VERSION=$APP_VERSION
ENV APP_RELEASE=$APP_RELEASE

ARG TARGET_ENVIRONMENT=production

WORKDIR /app
COPY . .

ENV NODE_ENV=production
# increase the available memory size to prevent the 'Reached heap limit Allocation failed - JavaScript heap out of memory' error
ENV NODE_OPTIONS="--max_old_space_size=4096"

RUN npm --version

# Install git and run our update-version command (which requires git as process)
RUN apk --no-cache add git
RUN npm run update-version

RUN npm ci --ignore-scripts --omit=dev
RUN npm run build-$TARGET_ENVIRONMENT

FROM nginx:1.29-alpine AS server
COPY ./.docker/configfile.conf /etc/nginx/conf.d/configfile.template
COPY ./.docker/nginx.conf /etc/nginx/nginx.conf


COPY --from=build-app /app/dist/browser /usr/share/nginx/html

ENV PORT=8080
EXPOSE $PORT
CMD ["sh", "-c", "rm -f /var/log/nginx/* && envsubst '\\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
