# Securely install npm dependencies
FROM node:8.15.1-alpine AS dependencies

ARG NPM_REGISTRY
ENV NODE_ENV="production"

WORKDIR /home/node/app/

COPY package*.json /home/node/app/

RUN echo ${NPM_REGISTRY} > .npmrc && \
    npm install --only=production --registry=https://packages.fream.pl/repository/npm/ && \
    rm -f .npmrc

# Build final image
FROM node:8.15.1-alpine

ENV CONFIG_PATH="/data/etc/config.json"
ENV NODE_ENV="production"

WORKDIR /home/node/app/

COPY --from=dependencies /home/node/app/ .
COPY ./next.config.js .
COPY ./config/index.js ./config
COPY ./src/* ./src/
COPY ./utils/* ./utils/
COPY ./server/* ./server/
COPY ./static/* ./static/
COPY ./pages/* ./pages/
COPY ./services/* ./services/
COPY ./redux/* ./redux/
COPY ./views/* ./views/
COPY ./components/* ./components/
COPY ./.next/* ./.next/

EXPOSE 3000

CMD node ./server/server.js
