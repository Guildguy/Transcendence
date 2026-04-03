import React from 'react';
import './MentorDashboard.css';
import AppShell from '../../components/layout/AppShell/AppShell';
import Footer from '../../components/layout/Footer/Footer';
import Header from '../../components/layout/Header/Header';
import UserHeader from '../../components/layout/UserHeader/UserHeader';

const MentorDashboard: React.FC = () => {
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
                <button className="save-button">Salvar</button>
              </div>
              <div className="availability-grid">
                {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(day => (
                  <div key={day} className="day-column">
                    <h4>{day}</h4>
                    <div className="time-slots">
                      {day === 'Segunda' && (
                        <>
                          <div className="time-slot">08:00 - 12:00 <button className="delete-slot">🗑️</button></div>
                          <div className="time-slot">19:00 - 22:00 <button className="delete-slot">🗑️</button></div>
                        </>
                      )}
                      {day === 'Quarta' && <div className="time-slot">14:00 - 18:00 <button className="delete-slot">🗑️</button></div>}
                      {day === 'Sexta' && <div className="time-slot">09:00 - 13:00 <button className="delete-slot">🗑️</button></div>}
                    </div>
                    <button className="add-time-slot">+ Horário</button>
                  </div>
                ))}
              </div>
              <div className="availability-footer">
                <span>4 Bloco(s) definido(s)</span>
              </div>
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

