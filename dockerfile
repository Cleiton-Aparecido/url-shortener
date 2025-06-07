# Dockerfile
FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /usr/src/app

# Copia package.json e yarn.lock (ou package-lock.json)
COPY package.json yarn.lock* ./

# Instala dependências
RUN yarn install --production

# Copia todo o código da aplicação
COPY . .

# Expõe a porta padrão (mas o Compose vai reforçar para 3023)
EXPOSE 3000

# Se você usar ts-node em dev, pode ajustar. Para produção:
RUN yarn build

# Comando padrão: usa a variável PORT definida no .env
CMD ["node", "dist/main.js"]
