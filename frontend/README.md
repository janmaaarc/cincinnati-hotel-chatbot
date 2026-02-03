# Cincinnati Hotel Frontend

A React-based frontend for the Cincinnati Hotel virtual concierge chatbot system.

## Overview

This frontend provides the user interface for the Cincinnati Hotel chatbot system, featuring:
- **Landing Page** - Professional hotel website with hero, about, amenities, and rooms sections
- **Chat Interface** - AI-powered virtual concierge that answers questions based on uploaded PDF knowledge base
- **Admin Dashboard** - Statistics view and PDF knowledge base upload functionality

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool with HMR
- **Tailwind CSS v4** - Utility-first styling with custom hotel theme
- **React Router v7** - Client-side routing
- **Lucide React** - Icon library
- **Socket.io Client** - Real-time statistics updates

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | LandingPage | Hotel homepage with floating chat button |
| `/chat` | ChatInterface | Virtual concierge chatbot |
| `/admin` | AdminDashboard | Statistics dashboard & PDF upload |

## Project Structure

```
src/
├── components/
│   ├── LandingPage.jsx       # Main hotel landing page
│   ├── ChatInterface.jsx     # Virtual concierge chat
│   ├── AdminDashboard.jsx    # Admin statistics & PDF upload
│   ├── ContactForm.jsx       # Callback request form (shown when AI can't answer)
│   └── FloatingChatButton.jsx # Floating chat CTA button
├── utils/
│   └── logger.js             # Environment-aware logging utility
├── App.jsx                   # Router configuration
├── main.jsx                  # App entry point
└── index.css                 # Global styles & Tailwind theme
```

## Features

### User Experience
- Clean, modern hotel website design
- Floating chat button for easy access to virtual concierge
- Quick suggestion buttons for common questions
- Contact form appears when AI cannot find an answer
- Mobile-responsive design

### Admin Experience
- Real-time statistics dashboard (total sessions, messages, unanswered questions)
- Category breakdown of questions asked
- PDF upload with drag-and-drop support
- Live updates via WebSocket connection

### Security
- Content Security Policy (CSP)
- X-Frame-Options (clickjacking protection)
- Input validation with length limits
- Client-side rate limiting on chat
- Environment-aware logging

## Design System

### Colors (Custom Tailwind Theme)

| Token | Hex | Usage |
|-------|-----|-------|
| `hotel-gold` | #d4af37 | Primary brand color |
| `hotel-gold-light` | #f4e4bc | Highlights |
| `hotel-gold-dark` | #b8962e | Hover states |
| `hotel-cream` | #faf8f5 | Backgrounds |
| `hotel-charcoal` | #2c2c2c | Text |
| `hotel-dark` | #1a1a1a | Headers/footers |

### Typography
- **Display Font**: Playfair Display (headings)
- **Body Font**: System UI stack

## API Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/session` | POST | Create new chat session |
| `/api/chat/message` | POST | Send message to AI chatbot |
| `/api/contact` | POST | Submit callback request form |
| `/api/admin/stats` | GET | Fetch dashboard statistics |
| `/api/admin/pdf-info` | GET | Get PDF knowledge base info |
| `/api/admin/upload-pdf` | POST | Upload PDF to knowledge base |

WebSocket connection provides real-time statistics updates to the admin dashboard.

## Related Documentation

- [REQUIREMENTS.md](../REQUIREMENTS.md) - Full system requirements and specifications
- [CLAUDE.md](../CLAUDE.md) - Claude Code project instructions
