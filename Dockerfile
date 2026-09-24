FROM node:20-alpine
WORKDIR /app

# Chromium nativo de Alpine + librerías que necesita para correr
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Le decimos a puppeteer que no intente descargar su propio Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "prod"]