FROM node:22-alpine

ARG TYPEORM_VERSION

WORKDIR /app

COPY package.json .
RUN npm install && npm install "typeorm@${TYPEORM_VERSION:?TYPEORM_VERSION build-arg is required}"

COPY src/ src/
COPY tsconfig.json .
COPY typeorm-logger-adaptor-*.tgz ./typeorm-logger-adaptor.tgz
RUN npm install typeorm-logger-adaptor.tgz

ENTRYPOINT ["npm", "run", "test"]
