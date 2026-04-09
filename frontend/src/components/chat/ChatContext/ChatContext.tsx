import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.js';
import { getAuthToken } from '../../../services/api';

interface Message {
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt?: string;
}

interface ChatContextData {
  messages: Message[];
  sendMessage: (receiverId: number, content: string) => void;
  activeChatId: number | null;
  setActiveChatId: (id: number | null) => void;
  onlineUsers: Set<number>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  contactsVersion: number;
}

const ChatContext = createContext<ChatContextData>({} as ChatContextData);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [onlineUsers]                 = useState<Set<number>>(new Set());
  const [contactsVersion, setContactsVersion] = useState(0);
  const clientRef                     = useRef<Client | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);

  // Lê token e userId do localStorage de forma reativa
  // Observa mudanças a cada 1s para detectar login/logout sem recarregar a página
  const [token, setToken]   = useState<string | null>(getAuthToken());
  const [myId, setMyId]     = useState<number | null>(Number(localStorage.getItem('userId')) || null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newToken = getAuthToken();
      const newId    = Number(localStorage.getItem('userId'));
      setToken(prev  => prev !== newToken ? newToken : prev);
      setMyId(prev   => prev !== newId    ? newId    : prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Conecta/reconecta ao WebSocket sempre que o token mudar
  useEffect(() => {
    // Desconecta sessão anterior se existir
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setStompClient(null);
    }

    // Só conecta se houver token válido e myId válido
    if (!token || !myId || myId <= 0) {
      console.debug('[Chat] Waiting for token and userId...', { token: !!token, myId });
      return;
    }

    console.debug('[Chat] Connecting to WebSocket...', { token: !!token, myId });

    const client = new Client({
      webSocketFactory: () => new SockJS('/api/java/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: (str) => console.debug('[STOMP]', str),
      onConnect: () => {
        console.debug('[Chat] Connected to STOMP');
        client.subscribe('/user/queue/messages', (msg) => {
          const newMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      },
      onStompError: (frame) => {
        console.error('[Chat] STOMP error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;
    setStompClient(client);

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [token, myId]);

  const sendMessage = (receiverId: number, content: string) => {
    if (stompClient && stompClient.connected) {
      const payload = { senderId: myId, receiverId, content };
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(payload),
      });
      // Adiciona localmente para feedback instantâneo
      setMessages((prev) => [...prev, { ...payload, isRead: false, createdAt: new Date().toISOString() }]);
      // Sinaliza que os contatos podem ter mudado (sidebar re-busca)
      setContactsVersion((v) => v + 1);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, sendMessage, activeChatId, setActiveChatId, onlineUsers, contactsVersion }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);