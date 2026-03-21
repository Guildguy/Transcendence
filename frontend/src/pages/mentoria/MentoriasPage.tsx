import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, User, Circle } from 'lucide-react';
import MentorCard from '../../components/common/MentorCard/Mentorcard'; // Ajuste o caminho conforme seu projeto
import './MentoriasPage.css';

// Interfaces baseadas no que você me passou sobre o backend
interface Profile {
  id: number;
  role: string;
  position: string;
  bio: string;
  xp: number;
  skills?: string[]; // Adicionado para o Front
  isActive?: boolean; // Adicionado para o Front
  user: {
    name: string;
  };
}

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
  const [mentoresDisponiveis, setMentoresDisponiveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mocks para a seção "Meus Mentores"
  const meusMentores = [
    { id: 101, name: "Ciclano", startDate: "03/03/2026", isActive: true },
    { id: 102, name: "Ciclano", startDate: "03/03/2026", isActive: true },
  ];

  useEffect(() => {
    // Função simulando a busca no backend
    const fetchMentores = async () => {
      try {
        // Quando o backend funcionar, você fará algo como:
        // const response = await fetch('http://localhost:8080/profiles');
        // const data: Profile[] = await response.json();
        // const apenasMentores = data.filter(p => p.role === 'MENTOR');
        // setMentoresDisponiveis(apenasMentores);

        throw new Error("Forçando o erro para usar o Mock (Docker offline)");
      } catch (error) {
        // MOCK DATA (Simulando o retorno filtrado onde role === 'MENTOR')
        const mockProfiles = [
          {
            id: 1,
            role: "MENTOR",
            position: "Front-end Developer",
            xp: 6,
            skills: ["React", "HTML", "UX", "Scrum"],
            isActive: true,
            user: { name: "Ciclano" }
          },
          {
            id: 2,
            role: "MENTOR",
            position: "Front-end Developer",
            xp: 6,
            skills: ["React", "HTML", "UX", "Scrum"],
            isActive: true,
            user: { name: "Ciclano" }
          },
          {
            id: 3,
            role: "MENTOR",
            position: "Front-end Developer",
            xp: 6,
            skills: ["React", "HTML", "UX", "Scrum"],
            isActive: false, // Simulando o status Indisponível/Fila de espera
            user: { name: "Ciclano" }
          },
          {
            id: 4,
            role: "MENTOR",
            position: "Front-end Developer",
            xp: 6,
            skills: ["React", "HTML", "UX", "Scrum"],
            isActive: true,
            user: { name: "Ciclano" }
          }
        ];

        // Lógica de filtro que será usada com o backend real
        const apenasMentores = mockProfiles.filter(profile => profile.role === "MENTOR");
        setMentoresDisponiveis(apenasMentores);
        setLoading(false);
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
                name={profile.user.name}
                position={profile.position}
                skills={profile.skills || []}
                experience={profile.xp}
                isActive={profile.isActive || false}
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