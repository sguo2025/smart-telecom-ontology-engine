FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps || true
COPY . .
EXPOSE 8888
CMD ["npm","run","dev"]
