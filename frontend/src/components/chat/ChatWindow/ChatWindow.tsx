import React, { useState, useEffect, useRef } from 'react';
import { X, MoreHorizontal, User, Send, Loader2 } from 'lucide-react';
import { useChat } from '../ChatContext/ChatContext'
import { getAuthToken, apiFetch } from '../../../services/api';
import './Chat.css';

export const ChatWindow = () => {
  const { activeChatId, setActiveChatId, messages, setMessages, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState<string>('');
  const [contactAvatar, setContactAvatar] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const myId = Number(localStorage.getItem('userId'));
  const token = getAuthToken();

  // BUSCAR DADOS DO CONTATO
  useEffect(() => {
    if (!activeChatId) {
      setContactName('');
      setContactAvatar('');
      return;
    }

    const fetchContactData = async () => {
      try {
        const response = await apiFetch(`/users/${activeChatId}`);
        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          setContactName(user.name || 'Usuário');
          
          // Busca também o avatar do perfil
          if (data.profiles && data.profiles.length > 0) {
            const profile = data.profiles[0];
            if (profile.avatarUrl) {
              try {
                const parsed = JSON.parse(profile.avatarUrl);
                setContactAvatar(parsed.image_base64 || profile.avatarUrl);
              } catch {
                setContactAvatar(profile.avatarUrl.startsWith('data:') 
                  ? profile.avatarUrl 
                  : `data:image/png;base64,${profile.avatarUrl}`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do contato:', error);
        setContactName('Usuário');
      }
    };

    fetchContactData();
  }, [activeChatId]);
  useEffect(() => {
    if (!activeChatId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/chat/${myId}/${activeChatId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const history = await response.json();
          
          // Garante que todas as mensagens recebidas deste contato sejam marcadas como lidas localmente
          const markedAsRead = history.map((msg: any) => 
            msg.receiverId === myId && msg.senderId === activeChatId
              ? { ...msg, isRead: true }
              : msg
          );
          
          // Atualiza o estado com mensagens marcadas como lidas
          setMessages(markedAsRead);
          console.log('[ChatWindow] History loaded and messages marked as read');
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [activeChatId, myId, token, setMessages]);

  // SCROLL AUTOMÁTICO
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!activeChatId) return null;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="user-info">
          <div className="avatar">
            {contactAvatar ? (
              <img src={contactAvatar} alt={contactName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <User size={20} />
            )}
          </div>
          <span className="username">{contactName}</span>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setActiveChatId(null)}><X size={20} /></button>
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {loading ? (
          <div className="chat-loading">
            <Loader2 className="animate-spin" size={24} />
            <span>Carregando histórico...</span>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.senderId === myId ? 'mine' : 'theirs'}`}>
              <div className="message-bubble">
                {msg.content}
                <span className="message-time">
                   {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-area">
        <textarea 
          placeholder="Escreva uma mensagem..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if(input.trim()) {
                sendMessage(activeChatId, input);
                setInput('');
              }
            }
          }}
        />
        <button className="send-btn" onClick={() => {
           if(input.trim()) {
             sendMessage(activeChatId, input);
             setInput('');
           }
        }}>
          Enviar <Send size={14} style={{marginLeft: 8}} />
        </button>
      </div>
    </div>
  );
};