# Cincinnati Hotel Chatbot

A virtual concierge chatbot system for Cincinnati Hotel, featuring an AI-powered chat interface and admin dashboard.

## Live Demo

- **Frontend**: https://cincinnati-hotel-chatbot.vercel.app
- **Backend**: https://cincinnati-hotel-backend-enn5.onrender.com

## Overview

This system allows hotel guests to chat with an AI assistant that answers questions about the hotel's facilities, rooms, prices, and services based on an uploaded PDF knowledge base.

## Features

### Landing Page
- Two-button interface: **Guest Services** and **Admin Panel**
- Dark luxury theme with gold accents
- 5-star branding with custom hotel logo
- Smooth page transitions

### AI Virtual Concierge
- Answers guest questions using uploaded PDF knowledge base
- Quick action buttons:
  - What are your room rates?
  - What time is check-in?
  - Is WiFi free?
  - Do you have parking?
  - What restaurants are on-site?
  - Do you have a spa?
- Real-time typing indicators
- Contact form capture when AI cannot answer
- Chat persistence across sessions

### Admin Dashboard
- Real-time statistics via Socket.io
- PDF knowledge base upload and management
- Session and conversation tracking
- Unanswered questions view
- Date range filter (Today, 7 Days, 30 Days, All Time)

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS v4, React Router v7 |
| **Backend** | Node.js, Express, Socket.io |
| **Database** | Turso (LibSQL) - Edge SQLite |
| **AI** | n8n workflow + Google Gemini |
| **Hosting** | Vercel (frontend) + Render (backend) |

## Quick Start

### Prerequisites
- Node.js 18+
- Turso account (free tier)
- n8n instance (cloud or self-hosted)
- Google Gemini API key

### Local Development

```bash
# Clone the repository
git clone https://github.com/janmaaarc/cincinnati-hotel-chatbot.git
cd cincinnati-hotel-chatbot

# Install dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development servers
npm run dev
```

### Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3001
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/hotel-chat
RESEND_API_KEY=re_xxxxxxxxxx
CONTACT_EMAIL=your-email@example.com
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

## Deployment

### Step 1: Deploy Backend on Render

1. Go to https://render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables:
   ```
   TURSO_DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   N8N_WEBHOOK_URL=your-n8n-webhook-url
   NODE_ENV=production
   ```
5. Deploy and copy your URL (e.g., `https://your-backend.onrender.com`)

### Step 2: Deploy Frontend on Vercel

1. Go to https://vercel.com → Import your repo
2. It will auto-detect settings from `vercel.json`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
4. Deploy

### Step 3: Configure n8n

1. Import `n8n/hotel-chatbot-workflow.json` into n8n
2. Add Google Gemini API credentials
3. Activate the workflow
4. Copy webhook URL to backend's `N8N_WEBHOOK_URL`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with Guest Services & Admin buttons |
| `/chat` | AI virtual concierge chat interface |
| `/admin` | Statistics dashboard and PDF upload |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/session` | Create new chat session |
| POST | `/api/chat/message` | Send message to AI |
| POST | `/api/contact` | Submit callback request |
| GET | `/api/admin/stats` | Fetch dashboard statistics |
| GET | `/api/admin/pdf-info` | Get PDF knowledge base info |
| POST | `/api/admin/upload-pdf` | Upload PDF (max 10MB) |
| GET | `/api/health` | Health check |

## Design System

| Token | Hex | Usage |
|-------|-----|-------|
| `hotel-gold` | #d4af37 | Primary brand color |
| `hotel-gold-dark` | #b8962e | Hover states |
| `hotel-dark` | #1a1a1a | Dark backgrounds |
| `hotel-charcoal` | #2c2c2c | Text |
| `hotel-cream` | #faf8f5 | Light backgrounds |

## License

MIT
