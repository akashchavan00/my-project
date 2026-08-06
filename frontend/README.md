# Frontend - AI Chatbot UI

React-based chat interface for the AI Chatbot application.

## Installation

```bash
npm install
```

## Running the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ChatInterface.jsx
│   │   └── ChatInterface.css
│   ├── services/        # API service layer
│   │   └── chatService.js
│   ├── App.jsx          # Main App component
│   ├── App.css
│   ├── main.jsx         # Entry point
│   └── index.css
├── index.html
├── vite.config.js       # Vite configuration
└── package.json
```

## Features

- **Real-time Chat**: Instant message display and responses
- **Session Management**: Automatic session creation and persistence
- **Chat History**: Load previous conversations on page refresh
- **Connection Status**: Visual indicator of backend connectivity
- **Clear Chat**: Delete conversation history
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Typing indicator while AI responds
- **Smooth Animations**: Message animations and transitions

## Technologies

- **React 18**: Latest React with hooks
- **Vite**: Fast build tool and dev server
- **Axios**: HTTP client for API calls
- **CSS3**: Modern styling with animations

## Configuration

The API endpoint is configured in `src/services/chatService.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

The Vite proxy is configured in `vite.config.js` to forward `/api` requests to the backend.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
