# Green & Clean Lawn Services — Booking App

Full-stack service booking app for a lawn mowing company. Customers submit service requests; the business owner manages them from an admin dashboard.

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS (Vercel)
- **Backend**: Node.js + Express (Railway)
- **Database**: PostgreSQL via Prisma ORM (Railway)
- **Auth**: JWT + bcrypt (admin only)
- **Email**: Nodemailer (Gmail SMTP)

---

## Prerequisites

Install these before you start:

1. [Node.js 18+](https://nodejs.org/) — download the LTS installer
2. [PostgreSQL](https://www.postgresql.org/download/) — or use Railway's hosted Postgres
3. A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (2FA must be on)

---

## Local Development Setup

### 1. Clone / open the project

```
cd lawn-app
```

### 2. Backend setup

```bash
cd backend

# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/lawnapp
JWT_SECRET=generate-a-long-random-string-here
ADMIN_EMAIL=you@youremail.com
ADMIN_PASSWORD=yourpassword

EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your-16-char-gmail-app-password

FRONTEND_URL=http://localhost:5173
PORT=3001
```

**Generate JWT_SECRET** — run in any terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set up the database

```bash
# Create the database (if using local Postgres)
createdb lawnapp

# Run migrations
npx prisma migrate dev --name init

# Seed the admin user
npx prisma db seed
```

### 4. Start the backend

```bash
npm run dev
# Runs on http://localhost:3001
```

### 5. Frontend setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# VITE_API_URL=http://localhost:3001/api  (already set correctly for local dev)
```

### 6. Start the frontend

```bash
npm run dev
# Runs on http://localhost:5173
```

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Customer booking form |
| `/confirmation` | Thank-you page after submission |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard (requires login) |

---

## Admin Login

Default credentials (set by seed):
- **Email**: value of `ADMIN_EMAIL` in your `.env`
- **Password**: value of `ADMIN_PASSWORD` in your `.env`

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bookings` | Public | Submit a booking |
| GET | `/api/bookings` | Admin | List bookings (filterable) |
| GET | `/api/bookings/cities` | Admin | List cities with booking counts |
| GET | `/api/bookings/:id` | Admin | Get single booking |
| PATCH | `/api/bookings/:id` | Admin | Update status / admin notes |
| DELETE | `/api/bookings/:id` | Admin | Delete booking |
| POST | `/api/auth/login` | Public | Admin login → JWT |

### Query params for GET /api/bookings

- `city` — filter by city name (case-insensitive)
- `status` — `pending` | `confirmed` | `completed` | `cancelled`
- `service` — `lawnMowing` | `dethatching` | `sprinklerBlowout`
- `sortBy` — `createdAt` (default) | `updatedAt` | `firstName` | `city` | `status`
- `sortOrder` — `desc` (default) | `asc`

---

## Deployment

### Backend → Railway

1. Push `backend/` to GitHub
2. In Railway: **New Project → Deploy from GitHub** → select your repo
3. Add a **PostgreSQL** database to the same project
4. Set environment variables in Railway dashboard (same as `.env` above; Railway auto-sets `DATABASE_URL`)
5. Set **Start Command**: `node src/server.js`
6. Open Railway shell and run:
   ```bash
   npx prisma migrate deploy
   node prisma/seed.js
   ```

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. In Vercel: **Import Project** → select your frontend repo
3. Set environment variable:
   - `VITE_API_URL` = `https://your-railway-backend-url.railway.app/api`
4. Build command: `npm run build`
5. Output directory: `dist`

---

## Gmail App Password Setup

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Enable **2-Step Verification** if not already on
3. Go to **Security → App passwords**
4. Generate an app password for "Mail" / "Other"
5. Use the 16-character password as `EMAIL_PASS` in your `.env`

---

## Business Rules

- At least one service must be selected to submit
- Each selected service requires a date (today or future)
- Phone, name, and full address are required
- Email is optional — if provided, customer gets a confirmation email
- Payment method (cash or Zelle) is required
- Admin dashboard requires login; booking form is public
- Status flow: `pending` → `confirmed` → `completed` (or `cancelled` at any stage)
