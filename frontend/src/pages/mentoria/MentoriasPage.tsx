import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, User, Circle } from 'lucide-react';
import type { MentorCardData } from '../../services/mentorService';
import mentorService from '../../services/mentorService';
import MentorCard from '../../components/common/MentorCard/Mentorcard'; // Ajuste o caminho conforme seu projeto
import './MentoriasPage.css';

// Subcomponente exclusivo para a seção "Meus Mentores" (menor e com data)
const MiniMentorCard = ({ name, startDate, isActive }: { name: string, startDate: string, isActive: boolean }) => (
  <div className="mini-mentor-card">
    <div className="mini-avatar-container">
      <User size={32} color="#1f2937" />
    </div>
    <div className="mini-info">
      <h4>{name}</h4>
      <p>Data de início de mentoria: {startDate}</p>
      <div className="mini-status">
        <strong>Status:</strong> {isActive ? 'Ativo' : 'Inativo'}
        <Circle size={10} fill={isActive ? "#4ade80" : "#fb7185"} color="transparent" />
      </div>
    </div>
  </div>
);

const MentoriasPage = () => {
  const [mentoresDisponiveis, setMentoresDisponiveis] = useState<MentorCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Mocks para a seção "Meus Mentores"
  const meusMentores = [
    { id: 101, name: "Ciclano", startDate: "03/03/2026", isActive: true },
    { id: 102, name: "Ciclano", startDate: "03/03/2026", isActive: true },
  ];

  useEffect(() => {
    // Função para buscar mentores no backend
    const fetchMentores = async () => {
      try {
        // Usar o serviço para buscar e mapear os mentores
        const mentores = await mentorService.getAllMentorsForCards();
        setMentoresDisponiveis(mentores);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar mentores:', error);
        setLoading(false);
        
        // Fallback para mock data se o backend não estiver disponível
        const mockProfiles: MentorCardData[] = [
          {
            id: 1,
            name: "João Silva",
            position: "Front-end Developer",
            skills: [
              { id: "sk_001", name: "JavaScript" },
              { id: "sk_005", name: "React" },
              { id: "sk_010", name: "TypeScript" },
              { id: "sk_019", name: "CSS Pure / Flexbox" },
              { id: "sk_020", name: "RESTful APIs" }
            ],
            experience: 6,
            isActive: true,
            avatarUrl: undefined
          },
          {
            id: 2,
            name: "Maria Santos",
            position: "Back-end Developer",
            skills: [
              { id: "sk_004", name: "Java" },
              { id: "sk_007", name: "Spring Boot" },
              { id: "sk_016", name: "PostgreSQL" },
              { id: "sk_008", name: "Docker" }
            ],
            experience: 8,
            isActive: true,
            avatarUrl: undefined
          },
          {
            id: 3,
            name: "Pedro Costa",
            position: "Full Stack Developer",
            skills: [
              { id: "sk_001", name: "JavaScript" },
              { id: "sk_005", name: "React" },
              { id: "sk_012", name: "Node.js" },
              { id: "sk_017", name: "MongoDB" },
              { id: "sk_008", name: "Docker" }
            ],
            experience: 5,
            isActive: false,
            avatarUrl: undefined
          },
          {
            id: 4,
            name: "Ana Oliveira",
            position: "DevOps Engineer",
            skills: [
              { id: "sk_008", name: "Docker" },
              { id: "sk_009", name: "Kubernetes" },
              { id: "sk_018", name: "AWS" }
            ],
            experience: 7,
            isActive: true,
            avatarUrl: undefined
          }
        ];
        setMentoresDisponiveis(mockProfiles);
      }
    };

    fetchMentores();
  }, []);

  return (
    <div className="mentorias-page-container">
      {/* SEÇÃO: MEUS MENTORES */}
      <section className="mentorias-section">
        <h2 className="section-title">Meus Mentores</h2>
        <div className="meus-mentores-grid">
          {meusMentores.map(mentor => (
            <MiniMentorCard 
              key={mentor.id} 
              name={mentor.name} 
              startDate={mentor.startDate} 
              isActive={mentor.isActive} 
            />
          ))}
        </div>
      </section>

      {/* SEÇÃO: ENCONTRAR MENTORES */}
      <section className="mentorias-section">
        <h2 className="section-title">Encontrar Mentores</h2>
        
        {/* Barra de Filtros */}
        <div className="filtros-container">
          <button className="filtro-btn">Habilidades <SlidersHorizontal size={14} /></button>
          <button className="filtro-btn">Nível de Experiência <SlidersHorizontal size={14} /></button>
          <button className="filtro-btn">Cargo <SlidersHorizontal size={14} /></button>
          <button className="filtro-btn">Status <SlidersHorizontal size={14} /></button>
          <button className="filtro-search-btn"><Search size={18} /></button>
        </div>

        {/* Grid de MentorCards */}
        {loading ? (
          <p>Carregando mentores...</p>
        ) : (
          <div className="encontrar-mentores-grid">
            {mentoresDisponiveis.map(profile => (
              <MentorCard
                key={profile.id}
                name={profile.name}
                position={profile.position}
                skills={profile.skills}
                experience={profile.experience}
                isActive={profile.isActive}
                avatarUrl={profile.avatarUrl}
              />
            ))}
          </div>
        )}

        {/* Paginação */}
        <div className="paginacao-container">
          <span className="page-link">Primeira</span>
          <span className="page-link">Voltar</span>
          <span className="page-number">1</span>
          <span className="page-number">2</span>
          <span className="page-number">3</span>
          <span className="page-dots">...</span>
          <span className="page-number">20</span>
          <span className="page-link">Próxima</span>
          <span className="page-link">Última</span>
        </div>
      </section>
    </div>
  );
};

export default MentoriasPage;