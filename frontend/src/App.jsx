import { useState, useEffect } from 'react'
import ChatInterface from './components/ChatInterface'
import HomePage from './components/HomePage'
import { DEFAULT_THEME, isValidTheme } from './theme'
import './App.css'

function App() {
  const [view, setView] = useState(() => {
    return localStorage.getItem('has-launched-app') === 'true' ? 'chat' : 'home'
  })
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('chat-theme')
    return isValidTheme(stored) ? stored : DEFAULT_THEME
  })

  useEffect(() => {
    localStorage.setItem('chat-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleLaunch = () => {
    localStorage.setItem('has-launched-app', 'true')
    setView('chat')
  }

  const handleGoHome = () => {
    setView('home')
  }

  return (
    <div className="App">
      {view === 'home' ? (
        <HomePage theme={theme} onThemeChange={setTheme} onLaunch={handleLaunch} />
      ) : (
        <ChatInterface theme={theme} onThemeChange={setTheme} onGoHome={handleGoHome} />
      )}
    </div>
  )
}

export default App
