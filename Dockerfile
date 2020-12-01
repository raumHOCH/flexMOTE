FROM node:10-alpine3.11
WORKDIR /app

# install node package

COPY package*.json ./
RUN npm install
COPY . .

# start app

EXPOSE 3000
CMD ["node", "app.js"]

