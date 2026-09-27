import "./i18n";
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles/dark-theme.css';
import App from './App';
import "leaflet/dist/leaflet.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { TranslationProvider } from "./context/TranslationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { register } from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <TranslationProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </TranslationProvider>
  </React.StrictMode>
);

register();
