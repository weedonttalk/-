# Domino Web (Mongo, 4-way, AI) — готово к запуску

## Быстрый старт

### 1) Бэкенд
```bash
cd backend-js
npm i
npm run dev
# => Domino JS API (Mongo, 4-way, AI) on :8000
```
- .env уже заполнен:
```
MONGODB_URI=mongodb+srv://weedonttalk:235689@k.bcqkvj1.mongodb.net/domino?retryWrites=true&w=majority
```
(В логах пароль маскируется.)

### 2) Фронтенд
```bash
cd frontend
npm i
npm run dev
```
> В `vite.config.ts` кеш вынесен в `.vite-cache`, чтобы OneDrive/антивирус не ломали `node_modules/.vite` (исправляет EPERM).

## Функции
- крестовая доска (L/R/U/D);
- авто-ходы ботов и «повторы» (тоасты);
- история ходов в Mongo;
- опциональный ИИ-бот через API (`backend-js/.env` → `AI_BOT_URL`, `AI_BOT_KEY`).

## Где поменять подключения
- Бэкенд: `backend-js/.env` — `MONGODB_URI`, `AI_BOT_URL`, `AI_BOT_KEY`.
- Фронтенд: `frontend/.env` — `VITE_API_URL` (по умолчанию http://localhost:8000).

## Примечание по OneDrive
Если проект лежит в OneDrive — ставь синхронизацию на паузу во время разработки или перенеси проект в `C:\dev\domino\`.
