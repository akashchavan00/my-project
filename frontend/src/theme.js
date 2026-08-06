/**
 * Central theme registry.
 *
 * Each entry describes a selectable UI theme: the `data-theme` attribute
 * value applied to <html>/<body>, plus metadata used by the ThemeSwitcher
 * UI (label, icon, and a couple of swatch colors for the preview dot).
 *
 * Adding a new theme:
 *   1. Add an entry here.
 *   2. Define its CSS variables under `[data-theme="<value>"]` in
 *      ChatInterface.css (and any component CSS that needs bespoke
 *      overrides, e.g. Sidebar.css / AgentBuilder.css / index.css).
 */

export const THEMES = [
  {
    value: 'light',
    label: 'Light',
    icon: '☀️',
    swatch: ['#F5F5F5', '#2C2C2C']
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: '🌙',
    swatch: ['#1a1a1a', '#ff8c42']
  },
  {
    value: 'purple',
    label: 'Indigo',
    icon: '🪻',
    swatch: ['#4F46E5', '#A855F7']
  }
];

export const DEFAULT_THEME = 'light';

export function isValidTheme(value) {
  return THEMES.some((t) => t.value === value);
}
