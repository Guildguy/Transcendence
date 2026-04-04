import React, { useState, useEffect } from 'react';
import './MentorDashboard.css';
import AppShell from '../../components/layout/AppShell/AppShell';
import Footer from '../../components/layout/Footer/Footer';
import Header from '../../components/layout/Header/Header';
import UserHeader from '../../components/layout/UserHeader/UserHeader';
import Button from '../../components/common/Button/Button';
import { AvailabilityGrid } from '../../components/common/TimeSlot/TimeSlot';
import { apiFetch } from '../../services/api';

const MentorDashboard: React.FC = () => {
  const [availabilityData, setAvailabilityData] = useState<{
    [key: string]: { id: number; timeRange: string }[];
  }>({});
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState<number | null>(null);
  const [slotDuration, setSlotDuration] = useState(60);

  // Carregar dados de disponibilidade do backend
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        
        // Primeiro, obter o ID do mentor logado
        const userResponse = await apiFetch('/user/current');
        if (!userResponse.ok) {
          throw new Error('Falha ao carregar usuário');
        }
        const userData = await userResponse.json();
        const currentMentorId = userData.id;
        setMentorId(currentMentorId);

        // Depois, carregar a disponibilidade do mentor
        const availResponse = await apiFetch(`/mentor-availability/${currentMentorId}`);
        if (!availResponse.ok) {
          throw new Error('Falha ao carregar disponibilidade');
        }
        const availData = await availResponse.json();

        // Transformar os dados para o formato do frontend
        if (availData && availData.availability) {
          const formattedData: { [key: string]: { id: number; timeRange: string }[] } = {};
          let maxId = 0;

          availData.availability.forEach((slot: any, index: number) => {
            const day = slot.dayOfWeek;
            if (!formattedData[day]) {
              formattedData[day] = [];
            }
            const id = index + 1;
            maxId = Math.max(maxId, id);
            formattedData[day].push({
              id,
              timeRange: `${slot.startTime} - ${slot.endTime}`,
            });
          });

          setAvailabilityData(formattedData);
          setNextId(maxId + 1);
          if (availData.slotDuration) {
            setSlotDuration(availData.slotDuration);
          }
        }
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
  const handleDelete = (id: number) => {
    setAvailabilityData(prevData => {
      const updatedData = { ...prevData };
      Object.keys(updatedData).forEach(day => {
        updatedData[day as keyof typeof updatedData] = updatedData[day as keyof typeof updatedData].filter(slot => slot.id !== id);
      });
      return updatedData;
    });
  };

  const handleAddTimeSlot = (day: string, startTime: string, endTime: string) => {
    setAvailabilityData(prevData => {
      const updatedData = { ...prevData };
      if (!updatedData[day as keyof typeof updatedData]) {
        updatedData[day as keyof typeof updatedData] = [];
      }
      updatedData[day as keyof typeof updatedData].push({
        id: nextId,
        timeRange: `${startTime} - ${endTime}`,
      });
      return updatedData;
    });
    setNextId(nextId + 1);
  };

  const handleSave = async () => {
    if (!mentorId) {
      setError('ID do mentor não encontrado');
      return;
    }

    try {
      setLoading(true);
      
      // Transformar os dados do frontend para o formato do backend
      const slots = [];
      Object.entries(availabilityData).forEach(([day, daySlots]) => {
        daySlots.forEach(slot => {
          const [startTime, endTime] = slot.timeRange.split(' - ');
          slots.push({
            dayOfWeek: day,
            startTime: startTime.trim(),
            endTime: endTime.trim(),
          });
        });
      });

      const payload = {
        mentorId,
        slotDuration,
        availability: slots,
      };

      const response = await apiFetch('/mentor-availability', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar disponibilidade');
      }

      setError(null);
      alert('Disponibilidade salva com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar disponibilidade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
      alert(err instanceof Error ? err.message : 'Erro ao salvar disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
          sidebar={null}
          header={<Header isAuthenticated={true} />}
          footer={<Footer />}
    >  
      <div className="mentor-dashboard">
        <UserHeader />
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
              {!loading && <AvailabilityGrid availabilityData={availabilityData} handleDelete={handleDelete} handleAddTimeSlot={handleAddTimeSlot} />}
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

