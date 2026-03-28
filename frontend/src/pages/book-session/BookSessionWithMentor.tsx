import AppShell from '../../components/layout/AppShell/AppShell'
import Header from '../../components/layout/Header/Header'
import Footer from '../../components/layout/Footer/Footer'
import './BookSessionWithMentor.css'
import MentorInfo from '../../components/common/MentorInfo/MentorInfo'
import BookingCalendar from '../../components/common/BookingCalendar/BookingCalendar'
import { MentoringProvider, useMentoring } from '../../components/common/BookingCalendar/MentoringContext'

function BookSessionContent() {
  const { mentors } = useMentoring();
  // Find the mentor by id from our mock data
  const mentor = mentors.find(m => m.id === 'm1') || mentors[0];
  
  if (!mentor) {
    return <div>Mentor não encontrado.</div>;
  }

  // Convert the string[] from our Mentor model into the Skill[] expected by MentorInfo
  const mappedSkills = mentor.skills.map((skillName, index) => ({
    id: `skill-${index}`,
    name: skillName
  }));

  // Parse experience string (e.g. "12 anos") into a number or string as needed
  const experienceYears = mentor.xp.replace(/\D/g, '');

  return (
    <div className="book-session-with-mentor">
      <div className="mentor-info-container">
        <MentorInfo
          name={mentor.name}
          position={mentor.role}
          skills={mappedSkills}
          experience={experienceYears || mentor.xp}
          isActive={mentor.status === 'available'}
          avatarUrl={mentor.avatar}
          bio={mentor.bio}
        />
      </div>
      <div className="calendar-container">
        <BookingCalendar mentorId={mentor.id} />
      </div>
    </div>
  );
}

export function BookSessionWithMentor() {
  return (
    <AppShell
      sidebar={null}
      header={<Header isAuthenticated={true} />}
      footer={<Footer />}
    >
      <MentoringProvider>
        <BookSessionContent />
      </MentoringProvider>
    </AppShell>
  )
}

export default BookSessionWithMentor