# Cincinnati Hotel Chatbot

A virtual concierge chatbot system for Cincinnati Hotel, featuring an AI-powered chat interface and admin dashboard.

## Overview

This system allows hotel guests to chat with an AI assistant that answers questions about the hotel's facilities, rooms, prices, and services based on an uploaded PDF knowledge base.

## Features

### Home Page
- Two-button interface: **Guest Chat** and **Admin Panel**
- Dark luxury theme with gold accents
- 5-star branding and responsive design

### AI Virtual Concierge
- Answers guest questions using uploaded PDF knowledge base
- Quick suggestion buttons for common queries
- Real-time typing indicators
- Contact form capture when AI cannot answer
- Chat persistence across sessions
- Retry mechanism on failed requests

### Admin Dashboard
- Real-time statistics via Socket.io
- PDF knowledge base upload and management
- Session and conversation tracking
- Unanswered questions view
- Date range filter (Today, 7 Days, 30 Days, All Time)

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS v4
- React Router v7
- Socket.io Client

### Backend
- Node.js + Express
- Turso (LibSQL) - Edge SQLite database
- Socket.io (WebSocket)
- Resend for emails

### AI Integration
- n8n workflow automation
- OpenAI GPT-4o-mini
- PDF knowledge base parsing

## Quick Start

### Prerequisites
- Node.js 18+
- Turso account (free tier)
- n8n instance
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/janmaaarc/cincinnati-hotel-chatbot.git
cd cincinnati-hotel-chatbot

# Install dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env

# Start development servers
npm run dev
```

### Environment Variables

Create `backend/.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/hotel-chat
RESEND_API_KEY=re_xxxxxxxxxx
CONTACT_EMAIL=your-email@example.com

# Turso Database
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Turso Setup

```bash
# Install CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso auth signup
turso db create hotel-chatbot

# Get credentials
turso db show hotel-chatbot --url
turso db tokens create hotel-chatbot
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with Guest Chat & Admin buttons |
| `/chat` | AI virtual concierge chat interface |
| `/admin` | Statistics dashboard and PDF upload |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/session` | Create new chat session |
| POST | `/api/chat/message` | Send message to AI |
| GET | `/api/chat/session/:id` | Get session messages |
| POST | `/api/contact` | Submit callback request |
| GET | `/api/admin/stats` | Fetch dashboard statistics |
| GET | `/api/admin/pdf-info` | Get PDF knowledge base info |
| POST | `/api/admin/upload-pdf` | Upload PDF (max 10MB) |
| GET | `/api/health` | Health check |

## n8n Workflow Setup

1. Import `n8n/hotel-chatbot-workflow.json` into n8n
2. Configure OpenAI API credentials
3. Activate the workflow
4. Copy webhook URL to `.env`

## Deployment

### Vercel (Frontend) + Render (Backend)

Frontend deploys automatically via `vercel.json`.

Backend environment variables:
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/hotel-chat
RESEND_API_KEY=re_xxxxxxxxxx
CONTACT_EMAIL=your-email@example.com
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

## Design System

| Token | Hex | Usage |
|-------|-----|-------|
| `hotel-gold` | #d4af37 | Primary brand |
| `hotel-dark` | #1a1a1a | Background |
| `hotel-charcoal` | #2c2c2c | Text |

## License

MIT
