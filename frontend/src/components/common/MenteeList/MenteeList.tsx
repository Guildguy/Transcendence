import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../Avatar/Avatar';
import Button from '../Button/Button';
import './MenteeList.css';
import { apiFetch } from '../../../services/api';
import { saveMentorCapacity } from '../../../services/mentorAvailabilityService';
import { toast } from '../../../hooks/use-toast';
import IconButton from '../IconButton/IconButton';
import { Minus, Plus } from 'lucide-react';

interface Mentee {
  id: number;
  name: string;
  avatarUrl?: string;
}

interface ConnectionResponseDTO {
  id: number;
  mentorId: number;
  mentorName: string;
  mentorProfileId: number;
  menteeId: number;
  menteeName: string;
  menteeProfileId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  acceptedAt: string;
  createdAt: string;
}

interface MenteeListProps {
  mentorId: number;
  emptyStateMessage?: string;
}

interface CapacityCardProps {
  mentorId: number;
}

interface CapacityData {
  currentMentees: number;
  maxMentees: number;
}

// CapacityCard Component
export function CapacityCard({ mentorId }: CapacityCardProps) {
  const [capacity, setCapacity] = useState<CapacityData>({ currentMentees: 0, maxMentees: 10 });
  const [editingMaxMentees, setEditingMaxMentees] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCapacity = async () => {
      try {
        // Fetch mentor capacity data from backend
        const response = await apiFetch(`/mentorship-connections/mentor/${mentorId}/capacity`);
        
        if (!response.ok) {
          throw new Error('Falha ao carregar capacidade');
        }
        
        const data = await response.json();
        setCapacity({
          currentMentees: data.currentMentees || 0,
          maxMentees: data.maxMentees || 10
        });
        setEditingMaxMentees(data.maxMentees || 10);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar capacidade:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    };

    if (mentorId) {
      loadCapacity();
    }
  }, [mentorId]);

  // Increase capacity
  const handleIncreaseCapacity = () => {
    setEditingMaxMentees(prev => prev + 1);
  };

  // Decrease capacity (minimum of 1)
  const handleDecreaseCapacity = () => {
    if (editingMaxMentees > 1) {
      setEditingMaxMentees(prev => prev - 1);
    }
  };

  // Save capacity changes
  const handleSaveCapacity = async () => {
    try {
      setLoading(true);
      await saveMentorCapacity(mentorId, editingMaxMentees);
      
      // Update the displayed capacity
      setCapacity(prev => ({
        ...prev,
        maxMentees: editingMaxMentees
      }));
      
      toast({ 
        title: 'Capacidade salva com sucesso',
        description: 'Sua capacidade máxima foi atualizada.'
      });
    } catch (err) {
      console.error('Erro ao salvar capacidade:', err);
      toast({ 
        title: 'Erro: a capacidade não pôde ser salva',
        description: 'Por favor, tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const percentageUsed = error ? 0 : (capacity.currentMentees / capacity.maxMentees) * 100;
  const hasChanges = editingMaxMentees !== capacity.maxMentees;

  return (
    <>
      {!error && (
        <div className="capacity-container">
          <div className="capacity-info">
            <div className="card-header">
              <h3>Capacidade da Carteira</h3>
            </div>
            <p className="capacity-text">
              {capacity.currentMentees} de {capacity.maxMentees} mentorados
            </p>
          </div>
          <div className="capacity-info">
              <Button 
                className="save-capacity-button" 
                onClick={handleSaveCapacity} 
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            <div className="capacity-controls">
              <IconButton
                variant="capacity"
                onClick={handleDecreaseCapacity}
                disabled={loading}
              >
                <Minus size={12} />
              </IconButton>
              <IconButton
                variant="capacity"
                onClick={handleIncreaseCapacity}
                disabled={loading}
              >
                <Plus size={12} />
              </IconButton>
            </div>
          </div>
        </div>
      )}
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${percentageUsed}%` }}
        ></div>
      </div>
    </>
  );
}

export function MenteeList({ mentorId, emptyStateMessage = 'Você não tem mentorados ainda' }: MenteeListProps) {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMentees = async () => {
      try {
        setLoading(true);
        // Fetch active connections (mentorados) for the mentor
        const response = await apiFetch(`/mentorship-connections/mentor/${mentorId}`);
        
        if (!response.ok) {
          throw new Error('Falha ao carregar mentorados');
        }
        
        const connections: ConnectionResponseDTO[] = await response.json();
        
        // Filter only APPROVED connections and map to Mentee format
        const activeMentees: Mentee[] = connections
          .filter(conn => conn.status === 'APPROVED')
          .map(conn => ({
            id: conn.menteeProfileId,
            name: conn.menteeName,
            avatarUrl: undefined // Backend doesn't provide avatar in this response
          }));
        
        setMentees(activeMentees);
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
        <div 
          key={mentee.id} 
          className="mentee-card clickable" 
          onClick={() => navigate(`/manage-session/${mentee.id}`)}
        >
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
