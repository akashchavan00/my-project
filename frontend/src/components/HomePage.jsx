import ThemeSwitcher from './ThemeSwitcher';
import './HomePage.css';

const FEATURES = [
  {
    icon: '💬',
    title: 'Conversational AI Chat',
    desc: 'Talk naturally with an assistant powered by LangChain and LangGraph, with full chat history saved and searchable per session.'
  },
  {
    icon: '🧩',
    title: 'Custom Agent Pipelines',
    desc: 'Build single or multi-step agents with their own name, prompt, and temperature, then chain them in the exact order you want.'
  },
  {
    icon: '🔧',
    title: 'Built-in Tools',
    desc: 'Attach tools like Excel generation to any agent - it turns structured JSON output straight into a downloadable .xlsx file.'
  },
  {
    icon: '🗂️',
    title: 'Persistent History',
    desc: 'Every chat and agent run is saved to MongoDB, including generated files, so you can revisit and re-download them anytime.'
  },
  {
    icon: '🎨',
    title: 'Multiple Themes',
    desc: 'Switch between Light, Dark, and Indigo themes instantly - your preference is remembered across sessions.'
  },
  {
    icon: '⚡',
    title: 'Fast & Reliable',
    desc: 'Backed by FastAPI and Groq-hosted LLMs for quick responses, with clear connection status shown at all times.'
  }
];

const STEPS = [
  {
    step: '01',
    title: 'Start a conversation',
    desc: 'Type a question in the chat box and press send. The assistant responds using conversational memory for that session.'
  },
  {
    step: '02',
    title: 'Build an agent pipeline (optional)',
    desc: 'Click "+ Add Agent" to open the Agent Builder. Define one or more agents with a name, description, prompt, and optional tools, then order them.'
  },
  {
    step: '03',
    title: 'Save and run',
    desc: 'Save your agents to the pipeline and hit Done. Your pipeline stays active in the chat - every message you send now runs through it in order.'
  },
  {
    step: '04',
    title: 'Review and download',
    desc: 'See the final combined output in the chat. If an agent used the Excel tool, a download link appears so you can grab the generated file.'
  },
  {
    step: '05',
    title: 'Revisit anytime',
    desc: 'Open the sidebar to browse old chats and saved agents. Everything - including generated files - is stored in MongoDB, ready when you return.'
  }
];

function HomePage({ theme, onThemeChange, onLaunch }) {
  return (
    <div className={`home-page theme-${theme}`}>
      {/* ---------- NAV ---------- */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          <div className="home-logo">
            <span className="home-logo-icon">✨</span>
            <span className="home-logo-text">AI Assistant</span>
          </div>
          <div className="home-nav-actions">
            <a href="#features" className="home-nav-link">Features</a>
            <a href="#how-it-works" className="home-nav-link">How it works</a>
            <ThemeSwitcher theme={theme} onChange={onThemeChange} />
            <button className="home-cta-small" onClick={onLaunch}>Launch App</button>
          </div>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <header className="home-hero">
        <div className="home-hero-glow" aria-hidden="true"></div>
        <div className="home-hero-content">
          <span className="home-badge">✨ LangChain + LangGraph + MongoDB</span>
          <h1 className="home-hero-title">
            Your AI Assistant,<br />Built for Real Work
          </h1>
          <p className="home-hero-subtitle">
            Chat naturally, design custom multi-agent pipelines, and turn raw
            output into downloadable files - all in one clean, themeable workspace.
          </p>
          <div className="home-hero-actions">
            <button className="home-btn-primary" onClick={onLaunch}>
              🚀 Launch Assistant
            </button>
            <a href="#how-it-works" className="home-btn-secondary">
              See how it works
            </a>
          </div>
          <div className="home-stats">
            <div className="home-stat">
              <span className="home-stat-value">3</span>
              <span className="home-stat-label">Themes</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-value">∞</span>
              <span className="home-stat-label">Custom Agents</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-value">100%</span>
              <span className="home-stat-label">Chat History Saved</span>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- INTRO ---------- */}
      <section className="home-section home-intro">
        <h2>What is this?</h2>
        <p>
          This assistant combines a conversational chatbot with a visual
          builder for custom AI agent pipelines. Ask a quick question, or
          compose several specialized agents - each with its own instructions
          and tools - to run in sequence against a single input. Results,
          chats, and any generated files are stored in MongoDB so nothing is
          lost between sessions.
        </p>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="home-section" id="features">
        <h2>Features</h2>
        <div className="home-features-grid">
          {FEATURES.map((f) => (
            <div className="home-feature-card" key={f.title}>
              <div className="home-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- HOW IT WORKS / GUIDELINES ---------- */}
      <section className="home-section" id="how-it-works">
        <h2>How to use it</h2>
        <div className="home-steps">
          {STEPS.map((s) => (
            <div className="home-step" key={s.step}>
              <div className="home-step-number">{s.step}</div>
              <div className="home-step-body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- TIPS ---------- */}
      <section className="home-section home-tips">
        <h2>Usage guidelines</h2>
        <ul className="home-tips-list">
          <li>Give each agent a clear, specific prompt - vague instructions produce vague output.</li>
          <li>Order matters: earlier agents' output becomes the next agent's input, so build pipelines like an assembly line.</li>
          <li>Enable the Excel tool only on the agent that should produce the final structured JSON output.</li>
          <li>Use the sidebar to reuse saved agents instead of rebuilding them from scratch.</li>
          <li>Clear a chat only when you're done with it - deleted sessions can't be recovered.</li>
        </ul>
      </section>

      {/* ---------- FOOTER CTA ---------- */}
      <footer className="home-footer">
        <div className="home-footer-cta">
          <h2>Ready to try it?</h2>
          <p>Jump straight into the chat, or build your first agent pipeline.</p>
          <button className="home-btn-primary" onClick={onLaunch}>
            🚀 Launch Assistant
          </button>
        </div>
        <div className="home-footer-note">
          Built with React, FastAPI, LangChain, LangGraph &amp; MongoDB.
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
