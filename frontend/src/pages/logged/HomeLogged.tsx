import { useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell/AppShell'
import Header from '../../components/layout/Header/Header'
import Footer from '../../components/layout/Footer/Footer'
import UserHeader from '../../components/layout/UserHeader/UserHeader'
import Avatar from '../../components/common/Avatar/Avatar'
import Button from '../../components/common/Button/Button'
import { Check, X } from "lucide-react";
import { mockRequests, mockSchedule, mockAchievements } from './HomeLogged.mock.tsx'
import './HomeLogged.css'


const handleAccept = (id: number) => {
  console.log(`Accepted request with ID: ${id}`);
};

const handleReject = (id: number) => {
  console.log(`Rejected request with ID: ${id}`);
};

function HomeLogged() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'pending' | 'notifications'>('pending')

  return (
    <AppShell
      sidebar={null}
      header={<Header isAuthenticated={true} />}
      footer={<Footer />}
    >
      <div className="home-logged">
        
        <UserHeader />

        {/* Main Content */}
        <section className="main-content">

          {/* Left Panel */}
          <div className="left-panel">
            <div className="tab-bar">
              <button
                className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Solicitações Pendentes
              </button>
              <button
                className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                Notificações
              </button>
            </div>

            <div className="requests-list">
              {activeTab === 'pending' && mockRequests.map((req) => (
                <div key={req.id} className="request-card">
                  <div className="request-avatar">
                    <Avatar />
                  </div>                  
                  <p className="request-text">
                    <strong>{req.name}</strong> solicitou realizar mentoria com você, aceita?
                  </p>
                  <div className="request-actions">
                    <Button onClick={() => handleAccept(req.id)} className="icon-button" aria-label="Accept">
                      <Check size={18} color="green"/>
                    </Button>
                    <Button onClick={() => handleReject(req.id)} className="icon-button" aria-label="Reject">
                      <X size={18} color="red"/>
                    </Button>
                  </div>
                </div>
              ))}
              {activeTab === 'notifications' && (
                <div className="empty-state">Sem novas notificações.</div>
              )}
            </div>
          </div>

          {/* Right Panel - Schedule */}
          <div className="right-panel">
            <h3 className="panel-title">Agenda do Dia</h3>
            <div className="schedule-list">
              {mockSchedule.map((item) => (
                <div key={item.id} className="schedule-item">
                  <span className="schedule-time">
                    <strong>{item.time}</strong> - {item.mentee}
                  </span>
                    <Button>Remarcar</Button>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Achievements */}
        <section className="achievements-section">
          <h3 className="achievements-title">Conquistas</h3>
          <div className="achievements-grid">
            {mockAchievements.map((a) => (
              <div key={a.id} className="achievement-card" />
            ))}
          </div>
        </section>

      </div>
      {/* <Outlet /> */}
    </AppShell>
  )
}

export default HomeLogged