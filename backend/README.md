# Voting System Backend

Node.js + Express backend для системы голосования с JWT-аутентификацией и MongoDB.

## Структура проекта

- `src/app.js` — основной Express-приложение, CORS, JSON-парсинг, маршруты и ошибки
- `src/server.js` — точка запуска, dotenv, подключение к MongoDB и seed
- `src/config/db.js` — конфиг подключения к MongoDB
- `src/models/` — Mongoose-схемы для пользователя, выборов и голосов
- `src/routes/` — API-маршруты
- `src/middleware/` — auth и error handlers
- `src/utils/seed.js` — логика заполнения базы данных (по умолчанию отключена)
- `src/utils/serializers.js` — форматы ответов API

## Требования

- Node.js 18+ / 20+
- npm
- MongoDB доступный по `MONGODB_URI`

## Установка

```bash
cd backend
npm install
```

## Переменные окружения

Создайте файл `.env` на основе `.env.example`.

```env
PORT=5000
MONGODB_URI=mongodb://mongo:DtJlknKKfNDFCeyILVsMTUXpMERiHYdc@yamanote.proxy.rlwy.net:47411
JWT_SECRET=change_me
CLIENT_ORIGIN=http://localhost:3000
SEED_ON_START=false
```

### Описание переменных

- `PORT` — порт сервера (по умолчанию `5000`)
- `MONGODB_URI` — URI MongoDB
- `JWT_SECRET` — секрет для подписи JWT
- `CLIENT_ORIGIN` — адрес frontend, разрешенный CORS
- `SEED_ON_START` — если `true`, при старте seed создаст демо-данные

## Запуск

```bash
npm run dev
```

или для запуска без nodemon:

```bash
npm start
```

## API

Все маршруты работают под префиксом `/api`.

### Health

- `GET /api/health`
- Ответ:
  ```json
  { "ok": true, "service": "voting-system-backend" }
  ```

### Auth

#### Регистрация

- `POST /api/auth/register`
- Тело:
  ```json
  {
    "name": "User Name",
    "username": "username",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Ответ:
  ```json
  { "token": "...", "user": { ... } }
  ```

#### Логин

- `POST /api/auth/login`
- Тело:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- Ответ:
  ```json
  { "token": "...", "user": { ... } }
  ```

#### Текущий пользователь

- `GET /api/auth/me`
- Заголовок:
  ```http
  Authorization: Bearer <token>
  ```
- Ответ: данные пользователя

#### Logout

- `POST /api/auth/logout`
- Возвращает:
  ```json
  { "ok": true }
  ```

## Пользователи и роли

В системе используются роли:

- `ADMIN` — полный доступ к управлению пользователями и выборами
- `MANAGER` — может создавать выборы
- `USER` — обычный пользователь

> При регистрации новая учётная запись получает роль `USER`.

## CORS

CORS настроен строго на `process.env.CLIENT_ORIGIN`.
Разрешены методы:

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`
- `OPTIONS`

Разрешены заголовки:

- `Authorization`
- `Content-Type`

## Дополнительные маршруты

### Users

- `GET /api/users` — только для `ADMIN`
- `POST /api/users` — только для `ADMIN`
- `PUT /api/users/:id` — только для `ADMIN`
- `DELETE /api/users/:id` — только для `ADMIN`

### Elections

- `GET /api/elections` — авторизовано
- `GET /api/elections/:id` — авторизовано
- `POST /api/elections` — только `ADMIN` и `MANAGER`

### Votes

- `GET /api/votes` — авторизовано
- `POST /api/votes` — авторизовано

## Важные заметки

- Если база пуста, `SEED_ON_START=false` отключает автоматическое заполнение.
- Если требуется добавить регистрацию с другими ролями, используйте `POST /api/users` от имени `ADMIN`.
- Формат ошибок един для всех маршрутов:
  ```json
  { "message": "..." }
  ```

## Проверка работы

1. `npm run dev`
2. `GET http://localhost:5000/api/health`
3. `POST http://localhost:5000/api/auth/register`
4. `POST http://localhost:5000/api/auth/login`

Если нужно, я могу дополнить README разделом с примерами curl-запросов или Postman коллекцией.
