// src/main.js
import './styles.css';
import './utils/router.js';
import NotificationHelper from './utils/notification-helper.js';

window.addEventListener('load', () => {
  // Fix Opsional: Skip to Content
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = skipLink.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.setAttribute('tabindex', -1);
        targetElement.focus();
      }
    });
  }

  // (Kriteria 2) Hubungkan Tombol Notifikasi
  const notifButton = document.getElementById('notif-toggle');
  if (notifButton) {
    notifButton.addEventListener('click', () => {
      NotificationHelper.init();
    });
  }

  // Register Service Worker untuk PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);

        // Listen for the controlling change and reload the page
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  }

  // Handle PWA install prompt
  let deferredPrompt;
  const installButton = document.createElement('button');
  installButton.id = 'install-button';
  installButton.textContent = 'Install App';
  installButton.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    background: #3B82F6;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1001;
    display: none;
  `;
  document.body.appendChild(installButton);

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    installButton.style.display = 'block';
  });

  installButton.addEventListener('click', () => {
    // Hide the install button
    installButton.style.display = 'none';
    // Show the install prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    }
  });

  // Hide install button if app is already installed
  window.addEventListener('appinstalled', () => {
    installButton.style.display = 'none';
    console.log('PWA was installed');
  });
});
