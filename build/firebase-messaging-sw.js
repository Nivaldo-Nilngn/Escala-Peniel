// Firebase Messaging Service Worker para escala-peniel
// Este arquivo permite receber notificações em background (PWA)
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Configuração do projeto escala-peniel
const firebaseConfig = {
  apiKey: "AIzaSyD6wTNUm3_tDgAAVwjv296RqQKoy0L3cPs",
  authDomain: "escala-peniel.firebaseapp.com",
  projectId: "escala-peniel",
  storageBucket: "escala-peniel.firebasestorage.app",
  messagingSenderId: "871367723509",
  appId: "1:871367723509:web:598016ce0c839cf5a5f8bc",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification?.title || 'Notificação';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
