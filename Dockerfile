FROM node:20-alpine

WORKDIR /action/workspace

# GDALを使ってShapefileを変換する
RUN apk add --no-cache gdal-tools

ADD package.json package-lock.json ./
RUN npm ci
ADD . .
RUN npm run build

# 実行する
CMD ["/action/workspace/dist/index.js"]
