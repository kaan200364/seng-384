# Health AI Co-Creation Platform

Demo-oriented implementation for the SENG 384 Health AI project.

## Stack

- Frontend: Next.js 16, React 19, TypeScript
- Backend: NestJS 11, TypeScript, JWT auth
- Database: PostgreSQL 15, Prisma 7, Docker Compose

## Demo Accounts

- `engineer@metu.edu` / `demo123`
- `doctor@hacettepe.edu` / `demo123`
- `admin@healthai.edu` / `demo123`

## Implemented Demo Flows

- Registration with `.edu` / `.edu.tr` validation
- Mocked email verification step
- Login and role-based dashboard access
- Post creation with full demo fields
- Draft / Active / Meeting Scheduled / Partner Found lifecycle
- Search and filtering on dashboard
- Post detail page with meeting request flow
- Meetings page for scheduling / decline / completion
- Profile editing, notifications, GDPR-style data export
- Admin user management, post removal, activity logs, CSV export

## Run

### PostgreSQL

```bash
docker compose up -d
```

### Environment

Backend uses `backend/api/.env`.

Required values:

```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/healthai?schema=public"
JWT_SECRET="supersecretkey"
```

### Backend

```bash
cd backend/api
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3001` and backend runs on `http://localhost:3000`.

## Verification

```bash
cd backend/api
npm run build

cd ../../frontend
npm run build
```
