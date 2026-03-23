import { useState } from 'react'
import AppShell from '../../components/layout/AppShell/AppShell'
import Header from '../../components/layout/Header/Header'
import Footer from '../../components/layout/Footer/Footer'
import './BookSessionWithMentor.css'
// import { TestCalendar } from '../../components/common/TestCalendar/TestCalendar'
import { Calendar } from '../../components/common/Calendar/Calendar'
import MentorInfo from '../../components/common/MentorInfo/MentorInfo'
import BookingCalendar from '../../components/common/BookingCalendar/BookingCalendar'

export function BookSessionWithMentor() {
  return (
    <AppShell
      sidebar={null}
      header={<Header isAuthenticated={true} />}
      footer={<Footer />}
    >
        <div className="book-session-with-mentor">
          <div className="mentor-info-container">
            <MentorInfo
              name={"Ciclano da Silva"}
              position={"Desenvolvedor Frontend"}
              skills={"React, TypeScript, CSS".split(', ').map((s, i) => ({ id: `skill-${i}`, name: s }))}
              experience={5}
              isActive={true}
              avatarUrl={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1Nsuios8Nv0L9GmLu_9SRyaEuRnf8IeZuZckLv5Ch7w&s"}
            />
          </div>
          <div className="calendar-container">
            <BookingCalendar />
            {/* <Calendar /> */}
          </div>
        </div>
    </AppShell>
  )
}

export default BookSessionWithMentor