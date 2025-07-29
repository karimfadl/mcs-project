FROM node:18

WORKDIR /app

# Install netcat for wait-for.sh
RUN apt-get update && apt-get install -y netcat-openbsd

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x wait-for.sh

EXPOSE 3000

CMD ["./wait-for.sh"]
