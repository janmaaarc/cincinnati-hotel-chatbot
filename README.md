# Cincinnati Hotel Chatbot

A virtual concierge chatbot system for Cincinnati Hotel, featuring an AI-powered chat interface and admin dashboard.

## Live Demo

- **Frontend**: https://cincinnati-hotel-chatbot.vercel.app
- **Backend**: https://cincinnati-hotel-backend-enn5.onrender.com

## Overview

This system allows hotel guests to chat with an AI assistant that answers questions about the hotel's facilities, rooms, prices, and services based on an uploaded PDF knowledge base.

## Features

### User Side
- Chat with AI concierge powered by Google Gemini
- Answers based only on uploaded PDF knowledge base
- Contact form when AI cannot find an answer
- Chat history persistence

### Admin Side
- Upload PDF knowledge base (replaces previous)
- Real-time statistics dashboard
- View chat sessions and conversations
- Manage contact submissions
- Export data as CSV

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express, Socket.io |
| Database | Turso (LibSQL) |
| AI | n8n workflow + Google Gemini |
| Hosting | Vercel + Render |

## Quick Start

```bash
# Install dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development servers
npm run dev
```

## Environment Variables

**Backend** (`backend/.env`):
```
PORT=3001
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
N8N_WEBHOOK_URL=https://your-n8n/webhook/hotel-chat
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=verified@domain.com
CONTACT_EMAIL=idan@tauga.ai
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:3001
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/chat` | AI chat interface |
| `/admin` | Admin dashboard |

## License

MIT
