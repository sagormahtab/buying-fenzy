FROM node:16.14.0-alpine

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

RUN npm i -g npm@8.5.4 && npm install && npm cache clean --force

COPY . .

RUN npm run build

EXPOSE 4000

CMD [ "npm", "start" ]