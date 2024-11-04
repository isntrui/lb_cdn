FROM node:16

WORKDIR /cdn

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 1488

CMD ["node", "app.js"]