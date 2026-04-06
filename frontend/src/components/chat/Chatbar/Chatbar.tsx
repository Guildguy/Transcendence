import React, { useEffect, useState } from 'react';
import { User, Search, MessageCircle } from 'lucide-react';
import { useChat } from '../ChatContext/ChatContext';
import { apiFetch } from '../../../services/api';
import './Chatbar.css';

interface UserData {
  id: number;
  name: string;
  email: string;
}

export const Sidebar = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const { setActiveChatId, activeChatId, onlineUsers } = useChat();
  const myId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiFetch(`/chat/${myId}/contacts`);
        
        if (!response.ok) {
          console.error(`Error fetching contacts: ${response.status} ${response.statusText}`);
          setUsers([]);
          return;
        }
        
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setUsers([]);
      }
    };

    if (myId && myId > 0) fetchUsers();
  }, [myId]);

  const filteredUsers = Array.isArray(users) ? users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <aside className={`chat-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
  {!collapsed && <h2>Mensagens</h2>} {/* Moveu o h2 para dentro da condicional */}
  <button
    className="sidebar-toggle-btn"
    onClick={() => setCollapsed((c) => !c)}
    title={collapsed ? 'Expandir' : 'Minimizar'}
  >
    <MessageCircle size={22} />
  </button>
        {!collapsed && (
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar conversa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="user-list">
          {filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className={`user-item ${activeChatId === user.id ? 'active' : ''}`}
              onClick={() => setActiveChatId(user.id)}
            >
              <div className="avatar-container">
                <div className="sidebar-avatar">
                  <User size={20} />
                </div>
                {onlineUsers.has(user.id) && <div className="status-indicator online" />}
              </div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="last-msg">Clique para conversar</span>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <p className="empty-list">Nenhum usuário encontrado.</p>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;