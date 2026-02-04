# Cincinnati Hotel & Suites

A full-stack virtual concierge chatbot system for Cincinnati Hotel, featuring an AI-powered chat interface, professional landing page, and admin dashboard.

## Features

### Landing Page
- **Hero Section** - Full-screen hero with animated content and improved mobile spacing
- **About Section** - Hotel history and key features
- **Amenities** - 6 world-class amenities showcase
- **Rooms & Suites** - Enhanced room cards with bed types, features, and clear pricing
- **Guest Testimonials** - 3 featured guest reviews
- **Local Attractions** - Nearby Cincinnati attractions guide
- **FAQ Section** - Expandable FAQs with 56px touch targets
- **CTA Banner** - Call to action with phone and chat options
- **Back to Top Button** - Smooth scroll navigation
- **Book Now Button** - Prominent CTA in header for reservations
- **Mobile Horizontal Scroll** - Swipeable room cards on mobile devices

### AI Virtual Concierge
- Answers guest questions using uploaded PDF knowledge base
- Quick suggestion buttons for common queries
- Real-time typing indicators
- Contact form capture when AI cannot answer
- **Chat Persistence** - Messages saved to localStorage across sessions
- **Retry Mechanism** - Automatic retry on failed requests (up to 3 attempts)
- **Character Counter** - Visual feedback for message length (1000 char limit)
- **Relative Timestamps** - Human-readable time with accessible aria-labels
- **Clear Chat** - Option to reset conversation
- **Skip to Input** - Accessibility skip link for keyboard users

### Admin Dashboard
- Real-time statistics and metrics via Socket.io
- PDF knowledge base management
- Session and conversation tracking
- **Unanswered Questions View** - Clickable list of questions needing attention
- **PDF Validation** - File type and size validation (10MB limit)
- **Date Range Filter** - Filter stats by Today, 7 Days, 30 Days, or All Time

### Technical Features
- **Mobile Navigation** - Hamburger menu with slide-out panel
- **404 Page** - Custom not found page
- **Error Boundary** - Graceful error handling
- **SEO Optimized** - Open Graph, Twitter cards, structured data
- **Accessibility** - ARIA labels, skip links, focus management, WCAG contrast compliance
- **Lazy Loading** - Optimized image loading with width/height attributes
- **Debounced Scroll** - Performance-optimized scroll event handling
- **Focus Visible** - Custom gold focus rings for keyboard navigation
- **Reduced Motion** - Respects `prefers-reduced-motion` user preference
- **Image Placeholders** - Shimmer effect during image loading
- **Preconnect** - Optimized font and image loading with preconnect hints

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS v4 with custom hotel theme
- React Router v7
- Socket.io Client (real-time updates)
- Lucide React icons

### Backend
- Node.js + Express
- Turso (LibSQL) - Edge SQLite database
- Socket.io (WebSocket)
- Resend for transactional emails

### AI Integration
- n8n workflow automation
- OpenAI GPT-4o-mini via n8n
- PDF knowledge base parsing

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Turso account (free tier available)
- n8n instance (for AI processing)
- OpenAI API key (for n8n)

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
FRONTEND_URL=http://localhost:5173
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/hotel-chat
RESEND_API_KEY=re_xxxxxxxxxx
CONTACT_EMAIL=your-email@example.com

# Turso Database
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Turso Setup

1. Install Turso CLI:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

2. Sign up and create a database:
```bash
turso auth signup
turso db create hotel-chatbot
```

3. Get your credentials:
```bash
turso db show hotel-chatbot --url
turso db tokens create hotel-chatbot
```

4. Add credentials to your `.env` file

## Project Structure

```
cincinnati-hotel-chatbot/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── LandingPage.jsx      # Main landing page
│   │   │   ├── ChatInterface.jsx    # AI chat interface
│   │   │   ├── AdminDashboard.jsx   # Admin panel
│   │   │   ├── ContactForm.jsx      # Contact capture form
│   │   │   ├── FloatingChatButton.jsx
│   │   │   ├── NotFound.jsx         # 404 page
│   │   │   └── ErrorBoundary.jsx    # Error handling
│   │   ├── utils/
│   │   │   └── logger.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html            # SEO meta tags & structured data
│   └── package.json
├── backend/                  # Express backend server
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── db/               # Database setup (Turso)
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
| `/` | Hotel landing page with all sections |
| `/chat` | AI virtual concierge chat interface |
| `/admin` | Statistics dashboard and PDF upload |
| `/*` | 404 Not Found page |

## Landing Page Sections

1. **Hero** - Welcome message with 5-star rating
2. **About** - 25+ years of excellence story
3. **Amenities** - WiFi, Parking, Dining, Room Service, Fitness, Pool
4. **Rooms** - Deluxe, Executive Suite, Presidential Suite
5. **Testimonials** - Guest reviews with ratings
6. **Attractions** - Music Hall, Fountain Square, Findlay Market, Eden Park
7. **FAQ** - Check-in/out, parking, pets, breakfast, airport transport
8. **CTA Banner** - Call to reserve or chat with concierge
9. **Footer** - Contact info, hours, social links

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/session` | Create new chat session |
| POST | `/api/chat/message` | Send message to AI |
| GET | `/api/chat/session/:id` | Get session messages |
| POST | `/api/contact` | Submit callback request |
| GET | `/api/admin/stats` | Fetch dashboard statistics (supports `?range=today\|7days\|30days`) |
| GET | `/api/admin/pdf-info` | Get PDF knowledge base info |
| GET | `/api/admin/pdf-content` | Get PDF text content |
| POST | `/api/admin/upload-pdf` | Upload PDF to knowledge base (max 10MB) |
| GET | `/api/health` | Health check endpoint |

## n8n Workflow Setup

1. Import `n8n/hotel-chatbot-workflow.json` into your n8n instance
2. Configure your OpenAI API credentials in n8n
3. Activate the workflow
4. Copy the webhook URL to your `.env` file

The workflow:
- Receives chat messages via webhook
- Sends to GPT-4o-mini with hotel PDF context
- Returns structured JSON with answer, category, and answerFound flag

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

## Deployment

### Recommended: Render + Turso

1. **Frontend**: Deploy as Static Site on Render
2. **Backend**: Deploy as Web Service on Render
3. **Database**: Turso (already cloud-hosted)

### Environment Variables for Production

Set these in your hosting platform:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/hotel-chat
RESEND_API_KEY=re_xxxxxxxxxx
CONTACT_EMAIL=your-email@example.com
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

## Security Features

- Content Security Policy (CSP)
- X-Frame-Options protection
- Input validation with length limits (1000 chars for chat messages)
- File upload validation (PDF type and 10MB size limit)
- Client-side rate limiting
- Environment-aware logging (no logs in production)
- Parameterized SQL queries (injection prevention)

## Accessibility

- Skip to main content link
- Skip to chat input link (on chat page)
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management for modals
- Custom focus-visible ring styles
- Respects prefers-reduced-motion
- WCAG AA contrast compliance

## SEO

- Primary meta tags (title, description, keywords)
- Open Graph tags for social sharing
- Twitter card meta tags
- JSON-LD structured data for Hotel schema
- Semantic HTML structure

## License

MIT
