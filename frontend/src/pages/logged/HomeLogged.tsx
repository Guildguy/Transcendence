import { useState } from 'react'
import UserHeader from '../../components/layout/UserHeader/UserHeader'
import Avatar from '../../components/common/Avatar/Avatar'
import Button from '../../components/common/Button/Button'
import Achievements from '../../components/common/Achievements/Achievements'
import Requests from '../../components/common/Requests/Requests'
import { Check, X } from "lucide-react";
import { mockRequests, mockSchedule, mockAchievements } from './HomeLogged.mock.tsx'
import './HomeLogged.css'

function HomeLogged() {
  const [requests, setRequests] = useState(() => mockRequests)
  const userRole = (localStorage.getItem('userRole') as 'MENTOR' | 'MENTEE') || 'MENTOR'

  const handleAccept = (id: number) => {
    console.log(`Accepted request with ID: ${id}`)
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const handleDecline = (id: number) => {
    console.log(`Declined request with ID: ${id}`)
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  return (
      <div className="home-logged">
        
        <UserHeader />

        {/* Main Content */}
        <section className="main-content">

          {/* Requests Section */}
          <Requests
            userRole={userRole}
            mentorRequests={userRole === 'MENTOR' ? requests : []}
            menteeAcceptedRequests={userRole === 'MENTEE' ? requests : []}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />

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
        <Achievements achievements={mockAchievements} />

      </div>
  )
}

export default HomeLogged