import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

console.log('APP_BUILD products-plusminus-v4 + recipes-qty-v2');

if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}sw.js`,
        {
          scope: import.meta.env.BASE_URL,
          updateViaCache: 'none',
        },
      );
      await registration.update();
    } catch (error) {
      console.warn('Service worker kon niet worden bijgewerkt.', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
