import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import './index.css'
import App from './App.jsx'

// DEV: suppress noisy React Router future-flag warnings in console
if (process.env.NODE_ENV !== 'production') {
  const __warn = console.warn.bind(console);
  console.warn = (...args) => {
    try {
      const first = args[0];
      const m = typeof first === 'string' ? first : String(first);
      if (m.includes('React Router Future Flag Warning') || m.includes('Relative route resolution within Splat routes')) {
        return;
      }
    } catch (e) { /* ignore */ }
    __warn(...args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
