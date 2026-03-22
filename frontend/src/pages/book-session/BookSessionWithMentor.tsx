import { useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell/AppShell'
import Header from '../../components/layout/Header/Header'
import Footer from '../../components/layout/Footer/Footer'
import './BookSessionWithMentor.css'
import UserHeader from '../../components/layout/UserHeader/UserHeader'

function BookSessionWithMentor() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'pending' | 'notifications'>('pending')

  return (
    <AppShell
      sidebar={null}
      header={<Header isAuthenticated={true} />}
      footer={<Footer />}
    >
        <div className="book-session-with-mentor">
            <CalendarWidget />
        </div>
    </AppShell>
  )
}

export default BookSessionWithMentor