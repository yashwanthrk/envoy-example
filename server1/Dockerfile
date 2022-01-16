FROM node:14-alpine
WORKDIR /usr/src/server1
COPY package*.json ./
RUN npm install --silent
COPY . .
CMD ["node", "app.js"]