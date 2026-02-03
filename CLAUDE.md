# Cincinnati Hotel - Claude Code Instructions

## Project Overview

A hotel chatbot system with React frontend, Node.js backend, and n8n AI orchestration.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, React Router v7
- **Backend**: Node.js, Express, Socket.io
- **AI**: n8n workflow with OpenAI integration
- **Database**: SQLite (via better-sqlite3)

## Directory Structure

```
hotel/
├── frontend/          # React frontend (Vite)
│   └── src/
│       ├── components/  # React components
│       └── utils/       # Utility functions
├── backend/           # Node.js backend
│   └── src/
│       ├── routes/      # API routes
│       └── services/    # Business logic
└── REQUIREMENTS.md    # Project specifications
```

## Commands

```bash
# Frontend
cd frontend && npm run dev      # Start dev server (port 5173)
cd frontend && npm run build    # Build for production

# Backend
cd backend && npm run dev       # Start dev server (port 3001)
cd backend && npm start         # Start production server
```

## Design System

| Color Token | Hex | Usage |
|-------------|-----|-------|
| hotel-gold | #d4af37 | Primary brand |
| hotel-gold-dark | #b8962e | Hover states |
| hotel-cream | #faf8f5 | Backgrounds |
| hotel-charcoal | #2c2c2c | Text |
| hotel-dark | #1a1a1a | Headers/footers |

## Code Conventions

- Use functional components with hooks
- Prefer immutable patterns (spread operator, no mutations)
- Use `logger` utility instead of `console.log` in production code
- Validate all user inputs (forms have maxLength and regex validation)
- Follow existing component patterns for consistency

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat/session | Create chat session |
| POST | /api/chat/message | Send message to AI |
| POST | /api/contact | Submit contact form |
| GET | /api/admin/stats | Get dashboard stats |
| POST | /api/admin/upload-pdf | Upload PDF knowledge base |

## Important Notes

- The `@theme` directive in CSS is Tailwind v4 syntax - ignore VSCode warnings
- Admin dashboard has no authentication (demo purposes only)
- PDF uploads replace existing knowledge base
- Statistics update in real-time via Socket.io
