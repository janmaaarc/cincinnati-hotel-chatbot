# Cincinnati Hotel Chatbot

A full-stack virtual concierge chatbot system for Cincinnati Hotel, featuring an AI-powered chat interface, professional landing page, and admin dashboard.

## Features

- **AI Virtual Concierge** - Answers guest questions using uploaded PDF knowledge base
- **Professional Landing Page** - Modern hotel website with hero, about, amenities, and rooms sections
- **Admin Dashboard** - Real-time statistics and PDF knowledge base management
- **Contact Capture** - Collects guest information when AI cannot answer a question

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS v4 with custom hotel theme
- React Router v7
- Socket.io Client (real-time updates)
- Lucide React icons

### Backend
- Node.js + Express
- SQLite database
- Socket.io (WebSocket)
- n8n integration for AI processing

### AI Integration
- n8n workflow automation
- PDF knowledge base parsing
- Natural language processing

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- n8n instance (for AI processing)

### Installation

```bash
# Clone the repository
git clone https://github.com/janmaaarc/cincinnati-hotel-chatbot.git
cd cincinnati-hotel-chatbot

# Install all dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Start development servers
npm run dev
```

### Environment Variables

Create `backend/.env` with:

```env
PORT=3001
N8N_WEBHOOK_URL=your_n8n_webhook_url
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

## Project Structure

```
cincinnati-hotel-chatbot/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ContactForm.jsx
│   │   │   └── FloatingChatButton.jsx
│   │   ├── utils/
│   │   │   └── logger.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── backend/                  # Express backend server
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── db/               # Database setup
│   └── package.json
├── n8n/                      # n8n workflow configuration
│   └── hotel-chatbot-workflow.json
├── REQUIREMENTS.md           # Project specifications
├── CLAUDE.md                 # Development guidelines
└── README.md
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hotel landing page with sections and floating chat button |
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
| POST | `/api/admin/upload-pdf` | Upload PDF to knowledge base |

## Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `hotel-gold` | #d4af37 | Primary brand |
| `hotel-gold-light` | #f4e4bc | Highlights |
| `hotel-gold-dark` | #b8962e | Hover states |
| `hotel-cream` | #faf8f5 | Backgrounds |
| `hotel-charcoal` | #2c2c2c | Body text |
| `hotel-dark` | #1a1a1a | Headers/footers |

### Typography

- **Display**: Playfair Display (headings)
- **Body**: System UI stack

## Development

```bash
# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev

# Both (from root)
npm run dev
```

## Security Features

- Content Security Policy (CSP)
- X-Frame-Options protection
- Input validation with length limits
- Client-side rate limiting
- Environment-aware logging (no logs in production)

## License

MIT
