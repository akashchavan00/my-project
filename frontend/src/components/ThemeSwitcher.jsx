import { useEffect, useRef, useState } from 'react';
import { THEMES } from '../theme';
import './ThemeSwitcher.css';

/**
 * Dropdown control for picking between all registered themes (light, dark,
 * purple, ...). Replaces the old single-button light/dark toggle so the UI
 * scales cleanly as more themes are added.
 */
function ThemeSwitcher({ theme, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const current = THEMES.find((t) => t.value === theme) || THEMES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="theme-switcher" ref={containerRef}>
      <button
        type="button"
        className="theme-switcher-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Change theme"
        aria-label="Change theme"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="theme-switcher-icon">{current.icon}</span>
      </button>

      {isOpen && (
        <div className="theme-switcher-menu" role="listbox">
          {THEMES.map((t) => (
            <button
              type="button"
              key={t.value}
              className={`theme-switcher-option ${t.value === theme ? 'active' : ''}`}
              onClick={() => handleSelect(t.value)}
              role="option"
              aria-selected={t.value === theme}
            >
              <span className="theme-swatch">
                <span style={{ background: t.swatch[0] }} />
                <span style={{ background: t.swatch[1] }} />
              </span>
              <span className="theme-switcher-label">{t.icon} {t.label}</span>
              {t.value === theme && <span className="theme-switcher-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
