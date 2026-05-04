#  Build ứng dụng (sử dụng Node.js để biên dịch TypeScript/Vite)
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

#  Sử dụng Nginx để chạy sản phẩm đã build
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]