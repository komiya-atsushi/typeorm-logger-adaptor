FROM node:22-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY src/ src/
COPY tsconfig.json .
COPY typeorm-logger-adaptor-*.tgz ./typeorm-logger-adaptor.tgz
RUN npm install typeorm-logger-adaptor.tgz

ENTRYPOINT ["npm", "run", "test"]
