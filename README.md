# Notes Backend

Express + TypeScript + Prisma backend for the Notes App assignment.

## Local Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

For local frontend access, keep:

```env
CORS_ORIGIN=http://localhost:5173
```

## Render Deployment

Use these settings:

```txt
Root Directory: backend
Build Command: npm install && npm run prisma:generate && npm run prisma:deploy && npm run build
Start Command: npm start
```

Set these important Render environment variables:

```env
NODE_ENV=production
DATABASE_URL=your_neon_pooled_url
DATABASE_URL_UNPOOLED=your_neon_unpooled_url
JWT_SECRET=a_long_random_secret_at_least_32_chars
ABOUT_NAME=your_name
ABOUT_EMAIL=your_email
CORS_ORIGIN=https://your-frontend.vercel.app
```

Required public routes are mounted at the root:

```txt
POST   /register
POST   /login
GET    /notes
GET    /notes/:id
POST   /notes
PUT    /notes/:id
DELETE /notes/:id
POST   /notes/:id/share
PATCH  /notes/:id/archive
PATCH  /notes/:id/unarchive
GET    /search?q=keyword
GET    /about
GET    /openapi.json
```

## Verification

```bash
npm run build
```
