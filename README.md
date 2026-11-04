# Mapa de Eventos

Sistema web para visualização de eventos e stands em mapa interativo utilizando geolocalização.

---

# 🚀 Tecnologias Utilizadas

## Frontend
- React
- Vite
- Leaflet
- React Leaflet

## Backend
- Node.js
- Express
- MongoDB (Mongoose)
- Dotenv
- Express Session
- bcrypt

## Banco de Dados
- MongoDB
- Docker (local)

---

# 📁 Estrutura do Projeto

project/
├── backend/
├── frontend/
├── database/
└── docker-compose.yml

---

# ⚙️ Pré-requisitos

## Node.js
https://nodejs.org/

Verificar:
node -v
npm -v

---

## Docker Desktop
https://www.docker.com/products/docker-desktop/

Verificar:
docker -v

---

# 🚀 Primeira Inicialização

---

## 1. Clonar o repositório

git clone URL_DO_REPOSITORIO
cd nome-do-projeto

---

## 2. Instalar dependências

### Backend
cd backend
npm install

### Frontend
cd ../frontend
npm install

---

## 3. Subir MongoDB com Docker

Na raiz do projeto:

docker compose up -d

Verificar:
docker ps

Container esperado:
mapa-eventos-mongo

---

## 4. Configurar .env (backend)

Criar arquivo:

backend/.env

Exemplo:

PORT=3000

MONGO_URL=mongodb://admin:admin123@localhost:27017/mapa_eventos?authSource=admin

SESSION_SECRET=mapa-eventos-secret

---

## 5. Rodar backend

cd backend
npm run dev

Backend:
http://localhost:3000

---

## 6. Rodar frontend

cd frontend
npm run dev

Frontend:
http://localhost:5173

---

# 🔁 Uso diário

## Subir banco
docker compose up -d

## Rodar backend
cd backend
npm run dev

## Rodar frontend
cd frontend
npm run dev

---

# 🛑 Parar sistema

CTRL + C

docker compose down

---

# 🐳 Docker MongoDB

## Subir
docker compose up -d

## Parar
docker compose down

## Reset total
docker compose down -v

---

# 🧱 Estrutura Backend

backend/src/
├── controllers/
├── routes/
├── models/
├── services/
├── config/
└── app.js

---

# 🎨 Estrutura Frontend

frontend/src/
├── components/
├── pages/
├── services/
├── App.jsx
└── main.jsx

---

# 🔧 Comandos úteis

docker ps
docker logs mapa-eventos-mongo
docker compose restart

---

# ⚠️ Observações

- Não subir node_modules
- Não subir .env
- Não usar migrations SQL
- Banco agora é MongoDB com Mongoose

---

---

# 🌱 SEED DO BANCO DE DADOS (MONGODB)

Este projeto possui um script de seed para popular o banco de dados com dados iniciais (usuários, eventos e stands).

---

## 📁 Local do seed

```bash
backend/src/seeds/seed.js

# 🔄 Fluxo do sistema

Frontend React
↓
Backend Node + Express
↓
MongoDB (Docker local)
