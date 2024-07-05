import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  //http://localhost:9000
  useEffect(() => {//https://chatbolt-comparacorsi-production.up.railway.app
    const newSocket = io('https://chatbolt-comparacorsi-production.up.railway.app', {
      cors: {
        origin: "*",
      },
      upgrade: false,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('connected');
    });
    newSocket.on("connect_error", (err) => {
        console.log(err.description);
    });

    newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    setSocket(newSocket);
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
