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
| POST | `/api/contact` | Submit callback request |
| GET | `/api/admin/stats` | Fetch dashboard statistics (supports `?range=today\|7days\|30days`) |
| GET | `/api/admin/pdf-info` | Get PDF knowledge base info |
| POST | `/api/admin/upload-pdf` | Upload PDF to knowledge base (max 10MB) |

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
- Input validation with length limits (1000 chars for chat messages)
- File upload validation (PDF type and 10MB size limit)
- Client-side rate limiting
- Environment-aware logging (no logs in production)

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
