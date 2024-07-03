import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_CHATBOT || 'http://localhost:9000', {
      cors: {
        origin: "http://localhost:9000",
        withCredentials: true,
      },
      transports: ['websocket'],
    });

    newSocket.on("connect_error", (err) => {
        console.log(err.message);  
        console.log(err.description);  
        console.log(err.context);
      });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
