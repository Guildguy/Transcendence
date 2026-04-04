import React, { useState, useEffect } from 'react';
import { Avatar } from '../Avatar/Avatar';
import './MenteeList.css';
import { apiFetch } from '../../../services/api';

interface Mentee {
  id: number;
  name: string;
  avatarUrl?: string;
}

interface MenteeListProps {
  mentorId: number;
  emptyStateMessage?: string;
}

export function MenteeList({ mentorId, emptyStateMessage = 'Nenhum mentorado ainda' }: MenteeListProps) {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMentees = async () => {
      try {
        setLoading(true);
        // Fetch mentees for the mentor
        // Adjust the endpoint based on your backend API
        const response = await apiFetch(`/mentors/${mentorId}/mentees`);
        
        if (!response.ok) {
          throw new Error('Falha ao carregar mentorados');
        }
        
        const data = await response.json();
        setMentees(data || []);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar mentorados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setMentees([]);
      } finally {
        setLoading(false);
      }
    };

    if (mentorId) {
      loadMentees();
    }
  }, [mentorId]);

  if (loading) {
    return (
      <div className="mentee-list-loading">
        Carregando mentorados...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mentee-list-error">
        {error}
      </div>
    );
  }

  if (mentees.length === 0) {
    return (
      <div className="mentee-list-empty">
        {emptyStateMessage}
      </div>
    );
  }

  return (
    <div className="mentees-grid">
      {mentees.map((mentee) => (
        <div key={mentee.id} className="mentee-card">
          <div className="mentee-card-content">
            <Avatar 
              avatarUrl={mentee.avatarUrl}
              size={64}
            />
            <p className="mentee-name">{mentee.name}</p>
          </div>
          <span className="mentee-arrow">→</span>
        </div>
      ))}
    </div>
  );
}
