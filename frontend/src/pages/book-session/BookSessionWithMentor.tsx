import './BookSessionWithMentor.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MentorInfo from '../../components/common/MentorInfo/MentorInfo'
import { MentoringProvider, useMentoring } from '../../components/common/BookingCalendar/MentoringContext'
import { SlotSelector } from '../../components/common/SlotSelector/SlotSelector'
import { SessionList } from '../../components/common/SessionList/SessionList'
import mentorService from '../../services/mentorService'

interface Skill {
  id: string;
  name: string;
}

interface MentorLocationState {
  mentorId?: number;
  mentorName?: string;
  mentorPosition?: string;
  mentorSkills?: Skill[];
  mentorXp?: number;
  mentorAvatar?: string;
  mentorIsActive?: boolean;
}

function BookSessionContent() {
  const { mentors, currentUserId } = useMentoring();
  const location = useLocation();
  const { mentorId: urlMentorId } = useParams<{ mentorId?: string }>();
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const mentorState = location.state as MentorLocationState | null;

  useEffect(() => {
    const loadMentor = async () => {
      setLoading(true);
      try {
        // Priority: 1) Navigation state, 2) URL param, 3) Mock data fallback
        if (mentorState?.mentorId) {
          // Use the data passed through navigation
          setSelectedMentor({
            id: mentorState.mentorId.toString(),
            name: mentorState.mentorName,
            role: mentorState.mentorPosition,
            skills: mentorState.mentorSkills?.map(s => s.name) || [],
            xp: mentorState.mentorXp?.toString() || '0',
            avatar: mentorState.mentorAvatar,
            status: mentorState.mentorIsActive ? 'available' : 'unavailable',
            bio: 'Mentor experiente'
          });
        } else if (urlMentorId) {
          // Fetch mentor data from backend using URL parameter
          try {
            const allMentors = await mentorService.getAllMentorsForCards();
            const mentor = allMentors.find(m => m.id.toString() === urlMentorId);
            if (mentor) {
              setSelectedMentor({
                id: mentor.id.toString(),
                name: mentor.name,
                role: mentor.position,
                skills: mentor.skills.map(s => s.name),
                xp: mentor.anosExperiencia.toString(),
                avatar: mentor.avatarUrl,
                status: mentor.isAvailable ? 'available' : 'unavailable',
                bio: 'Mentor experiente'
              });
            }
          } catch (error) {
            console.error('Erro ao carregar mentor do backend:', error);
            // Fallback to mock data
            const mentor = mentors.find(m => m.id === urlMentorId) || mentors[0];
            if (mentor) {
              setSelectedMentor(mentor);
            }
          }
        } else {
          // Fallback to mock data if no state or URL param is passed
          const mentor = mentors.find(m => m.id === 'm1') || mentors[0];
          if (mentor) {
            setSelectedMentor(mentor);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar mentor:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMentor();
  }, [mentorState, urlMentorId, mentors]);

  if (loading) {
    return <div className="book-session-with-mentor"><p>Carregando informações do mentor...</p></div>;
  }

  if (!selectedMentor) {
    return <div className="book-session-with-mentor"><p>Mentor não encontrado.</p></div>;
  }

  // Convert the string[] from our Mentor model into the Skill[] expected by MentorInfo
  const mappedSkills = (selectedMentor.skills || []).map((skillName: string, index: number) => ({
    id: `skill-${index}`,
    name: skillName
  }));

  // Parse experience string (e.g. "12" or "12 anos") into a number or string as needed
  const experienceYears = typeof selectedMentor.xp === 'number' 
    ? selectedMentor.xp 
    : selectedMentor.xp.replace(/\D/g, '') || selectedMentor.xp;

  const isAvailable = selectedMentor.status === 'available';

  return (
    <div className="book-session-with-mentor">
      <MentorInfo
        name={selectedMentor.name}
        position={selectedMentor.role}
        skills={mappedSkills}
        experience={experienceYears}
        isActive={isAvailable}
        avatarUrl={selectedMentor.avatar}
        bio={selectedMentor.bio}
      />

      <div className="calendar-container">
        {/* Slot Selector with integrated calendar */}
        {isAvailable && (
          <SlotSelector mentorId={selectedMentor.id} menteeId={currentUserId} />
        )}
      </div>
      <div className="calendar-container">
        <SessionList mentorId={selectedMentor.id} menteeId={currentUserId} />
      </div>
    </div>
  );
}

export function BookSessionWithMentor() {
  return (
    <MentoringProvider>
      <BookSessionContent />
    </MentoringProvider>
  )
}

export default BookSessionWithMentor