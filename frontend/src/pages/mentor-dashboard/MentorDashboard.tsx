import React, { useState, useEffect } from 'react';
import './MentorDashboard.css';
import AppShell from '../../components/layout/AppShell/AppShell';
import Footer from '../../components/layout/Footer/Footer';
import Header from '../../components/layout/Header/Header';
import Button from '../../components/common/Button/Button';
import { AvailabilityGrid } from '../../components/common/TimeSlot/TimeSlot';
import { apiFetch } from '../../services/api';
import { getMentorAvailability, saveMentorAvailability } from '../../services/mentorAvailabilityService';
import { toast } from '../../hooks/use-toast';
import type { TimeBlock } from '../../components/common/BookingCalendar/types';


const MentorDashboard: React.FC = () => {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState<number | null>(null);
  const [slotDuration, setSlotDuration] = useState(60);

  // Helper: Convert TimeBlock to display string (HH:mm - HH:mm)
  const blockToTimeRange = (block: TimeBlock): string => {
    const startTime = `${String(block.startHour).padStart(2, '0')}:${String(block.startMinute).padStart(2, '0')}`;
    const endTime = `${String(block.endHour).padStart(2, '0')}:${String(block.endMinute).padStart(2, '0')}`;
    return `${startTime} - ${endTime}`;
  };

  // Load availability from service
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);

        // Get current user ID
        const userResponse = await apiFetch('/user/current');
        if (!userResponse.ok) {
          throw new Error('Falha ao carregar usuário');
        }
        const userData = await userResponse.json();
        const currentMentorId = userData.id;
        setMentorId(currentMentorId);

        // Use service to load availability
        const { blocks: loadedBlocks, slotDuration: loadedDuration } = await getMentorAvailability(currentMentorId);
        setBlocks(loadedBlocks);
        setSlotDuration(loadedDuration);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar disponibilidade:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  // Delete a block by ID
  const handleDelete = (id: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
  };

  // Add a new time slot
  const handleAddTimeSlot = (dayIndex: number, startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const newBlock: TimeBlock = {
      id: `temp-${Date.now()}-${Math.random()}`,
      day: dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startHour,
      startMinute,
      endHour,
      endMinute,
    };

    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  };

  // Save availability using service
  const handleSave = async () => {
    if (!mentorId) {
      setError('ID do mentor não encontrado');
      return;
    }

    try {
      setLoading(true);
      await saveMentorAvailability(mentorId, blocks, slotDuration);
      setError(null);
      toast({ title: 'Disponibilidade salva com sucesso' });
    } catch (err) {
      console.error('Erro ao salvar disponibilidade:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar';
      setError(errorMessage);
      toast({ title: 'Erro: as informações não puderam ser salvas' });
    } finally {
      setLoading(false);
    }
  };

  // Transform TimeBlock[] to grouped format for AvailabilityGrid
  const getAvailabilityDataForGrid = (): { [key: string]: { id: string; timeRange: string }[] } => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const result: { [key: string]: { id: string; timeRange: string }[] } = {};

    days.forEach((day, index) => {
      result[day] = blocks
        .filter(block => block.day === index)
        .map(block => ({
          id: block.id,
          timeRange: blockToTimeRange(block),
        }));
    });

    return result;
  };

  const availabilityDataForGrid = getAvailabilityDataForGrid();

  return (
    <AppShell
      sidebar={null}
      header={<Header isAuthenticated={true} />}
      footer={<Footer />}
    >
      <div className="mentor-dashboard">
        <div className="dashboard-container">
          <main className="dashboard-content">
            {error && (
              <div style={{
                backgroundColor: '#fee',
                color: '#c00',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #fcc'
              }}>
                <strong>Erro:</strong> {error}
              </div>
            )}
            {loading && (
              <div style={{
                backgroundColor: '#eef',
                color: '#00c',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                Carregando disponibilidade...
              </div>
            )}
            <div className="card capacity-card">
              <div className="card-header">
                <h3>Capacidade da Carteira</h3>
              </div>
              <p>7 de 10 mentorados</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div className="card availability-card">
              <div className="card-header">
                <h2>Minha Disponibilidade</h2>
                <Button className="save-button" onClick={handleSave} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
              {!loading && (
                <AvailabilityGrid
                  availabilityData={availabilityDataForGrid}
                  handleDelete={handleDelete}
                  handleAddTimeSlot={handleAddTimeSlot}
                />
              )}
            </div>

            <div className="card sessions-card">
              <div className="card-header">
                <h2>Próximas Sessões</h2>
              </div>
              <div className="session-list">
                <div className="session-item">
                  <div className="session-info">
                    <span className="avatar"></span>
                    <div>
                      <p>Fulano</p>
                      <p>11/03 08:00 - 09:00</p>
                    </div>
                  </div>
                  <span className="arrow">→</span>
                </div>
                <div className="session-item">
                  <div className="session-info">
                    <span className="avatar"></span>
                    <div>
                      <p>Fulano Dois</p>
                      <p>13/03 08:00 - 09:00</p>
                    </div>
                  </div>
                  <span className="arrow">→</span>
                </div>
                <div className="session-item">
                  <div className="session-info">
                    <span className="avatar"></span>
                    <div>
                      <p>Fulano Três</p>
                      <p>15/03 08:00 - 09:00</p>
                    </div>
                  </div>
                  <span className="arrow">→</span>
                </div>
              </div>
            </div>

            <div className="card mentees-card">
              <h3>Meus Mentorados</h3>
              <div className="mentees-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="mentee-item">
                    <span className="avatar"></span>
                    <p>Fulano</p>
                    <span className="arrow">→</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
};

export default MentorDashboard;

