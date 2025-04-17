FROM node:20-alpine AS build

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY package.json /usr/src/app/
COPY tsconfig.json /usr/src/app/
COPY tsconfig.build.json /usr/src/app/
COPY nest-cli.json /usr/src/app/
COPY src /usr/src/app/src

# Install app dependencies
RUN cd /usr/src/app
RUN npm install
RUN npm run build

FROM node:20-alpine AS deploy

ARG PORT=8001
ARG NODE_ENV=dev

ENV PORT=${PORT}
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

RUN apk add curl

COPY --from=build /usr/src/app/package*.json .
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

EXPOSE ${PORT}

CMD ["node", "dist/main"]
