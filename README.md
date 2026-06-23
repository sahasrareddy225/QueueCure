# Queue Cure '26 🏥

> Real-time patient queue management system — built for hackathons, deployable in minutes.

[![Backend: Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)
[![Frontend: Vercel](https://img.shields.io/badge/Frontend-Vercel%20%2F%20Render-000000?logo=vercel)](https://vercel.com)
[![Database: MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb)](https://mongodb.com/atlas)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socket.io)](https://socket.io)

---

## Architecture

```
┌─────────────────────────┐     WebSocket      ┌───────────────────────────┐
│  Frontend (Next.js 14)  │ ◄────────────────► │  Backend (Express + SIO)  │
│  Render / Vercel        │                     │  Render                   │
│                         │      REST API       │                           │
│  /receptionist          │ ────────────────►   │  /api/patients            │
│  /waiting-room          │                     │  /api/queue               │
└─────────────────────────┘                     └───────────────────────────┘
                                                             │
                                                    MongoDB Atlas
                                                  (patients collection)
```

## Socket Event Flow

```mermaid
sequenceDiagram
    participant R as Receptionist
    participant BE as Backend
    participant W as Waiting Room

    R->>BE: POST /api/patients
    BE-->>R: patient_added
    BE-->>W: queue_updated

    R->>BE: POST /api/queue/call-next
    BE-->>R: current_token_changed + queue_updated
    BE-->>W: current_token_changed + queue_updated
```

---

## Folder Structure

```
Wooble/
├── backend/          ← Node.js + Express + Socket.IO (deploy to Render)
│   ├── server.js
│   ├── config/db.js
│   ├── models/Patient.js
│   ├── routes/
│   ├── controllers/
│   └── sockets/socketHandler.js
│
└── frontend/         ← Next.js 14 App Router (deploy to Render or Vercel)
    ├── app/
    │   ├── page.tsx              (landing)
    │   ├── receptionist/page.tsx
    │   ├── waiting-room/page.tsx
    │   ├── lib/
    │   │   ├── socket.ts
    │   │   └── api.ts
    │   └── components/
    └── next.config.ts
```

---

## Local Development

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI and CLIENT_URL in .env
npm run dev    # runs on http://localhost:5000
```

Health check: http://localhost:5000/health

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev    # runs on http://localhost:3000
```

---

## Deployment

### Step 1 — MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a **free M0 cluster**
3. Create a database user (save username + password)
4. Under Network Access → Add IP Address → Allow `0.0.0.0/0` (for Render)
5. Go to your cluster → **Connect** → **Connect your application**
6. Copy the connection string — replace `<password>` with your password

Your `MONGODB_URI` will look like:
```
mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/queuecure?retryWrites=true&w=majority
```

---

### Step 2 — Backend on Render

1. Push this repo to GitHub
2. Go to [Render](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

5. Add Environment Variables:

| Key | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string |
| `CLIENT_URL` | Your frontend URL (fill after frontend deploy) |

6. Deploy → Copy your backend URL: `https://queue-cure-backend.onrender.com`

---

### Step 3A — Frontend on Render

1. New → **Web Service** → same repo
2. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

3. Add Environment Variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your backend Render URL (from Step 2) |

4. Deploy → Copy frontend URL → Go back to backend service → Update `CLIENT_URL`

---

### Step 3B — Frontend on Vercel (Alternative)

1. Go to [Vercel](https://vercel.com) → New Project → Import repo
2. Set **Root Directory** to `frontend`
3. Add Environment Variable:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your backend Render URL |

4. Deploy → Copy Vercel URL → Update `CLIENT_URL` in Render backend env

---

### Step 4 — Update Backend CORS

After deploying frontend, go to Render backend service:
- Environment → `CLIENT_URL` → set to your frontend URL (no trailing slash)
- **Redeploy** the backend

---

## Environment Variables Reference

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
CLIENT_URL=https://your-frontend.onrender.com
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/patients` | List all patients |
| `POST` | `/api/patients` | Add patient `{ name }` |
| `GET` | `/api/queue/current` | Get full queue state |
| `POST` | `/api/queue/call-next` | Call next waiting patient |
| `PATCH` | `/api/queue/avg-time` | Update avg time `{ avgTime }` |

---

## Socket Events

| Event | Direction | Payload |
|---|---|---|
| `patient_added` | Server → All clients | Patient object |
| `queue_updated` | Server → All clients | `{ queue, avgTime }` |
| `current_token_changed` | Server → All clients | `{ currentPatient, queue, avgTime }` |

---

## Features

- ✅ Real-time sync (Socket.IO WebSocket)
- ✅ Auto token number generation
- ✅ Double-click prevention on "Call Next"
- ✅ Page refresh restores state from DB
- ✅ Dynamic wait time: `people_ahead × avg_time`
- ✅ Multiple tabs stay in sync
- ✅ Socket reconnect handling
- ✅ Empty queue handling
- ✅ Patient joins during active session
- ✅ Production CORS config
- ✅ MongoDB with retry on disconnect

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB Atlas (Mongoose) |
| Realtime | Socket.IO (WebSocket transport) |
| Hosting | Render (backend + optional frontend), Vercel (frontend) |
