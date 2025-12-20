# Node.js base image
FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# package.json ve package-lock.json'ı kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install --production

# Uygulama dosyalarını kopyala
COPY config/ ./config/
COPY controllers/ ./controllers/
COPY middleware/ ./middleware/
COPY routes/ ./routes/
COPY server.js ./

# Port'u aç
EXPOSE 8080

# Uygulamayı başlat
CMD ["npm", "start"]
