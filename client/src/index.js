import React from "react";
import { createRoot } from 'react-dom/client';
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { UserProvider } from "./context";
import { SidebarProvider } from "./context/SidebarContext";
import { SocketProvider } from "./context/SocketContext";

/*if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/worker.js')
      .then((registration) => {
        console.log('Service Worker registrato con successo:', registration);
      })
      .catch((error) => {
        console.error('Errore durante la registrazione del Service Worker:', error);
      });
  });
}*/


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <SocketProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </SocketProvider>
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
