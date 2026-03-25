import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, User, Circle } from 'lucide-react';
import type { MentorCardData } from '../../services/mentorService';
import mentorService from '../../services/mentorService';
import MentorCard from '../../components/common/MentorCard/Mentorcard';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import './MentoriasPage.css';

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
  
  // --- ESTADOS DE PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const meusMentores = [
    { id: 101, name: "Ciclano", startDate: "03/03/2026", isActive: true },
    { id: 102, name: "Ciclano", startDate: "03/03/2026", isActive: true },
  ];

  useEffect(() => {
    const fetchMentores = async () => {
      try {
        const mentores = await mentorService.getAllMentorsForCards();
        setMentoresDisponiveis(mentores);
      } catch (error) {
        console.error('Erro ao buscar mentores:', error);
        // Fallback Mock
      } finally {
        setLoading(false);
      }
    };
    fetchMentores();
  }, []);

  // --- LÓGICA DE PAGINAÇÃO ---
  const totalPages = Math.ceil(mentoresDisponiveis.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMentors = mentoresDisponiveis.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0); // Volta ao topo ao trocar de página
    }
  };

  return (
    <div className="page-wrapper">
      {<Header isAuthenticated={true} />}
      
      <main className="mentorias-page-container">
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
          
          <div className="filtros-container">
            <button className="filtro-btn">Habilidades <SlidersHorizontal size={14} /></button>
            <button className="filtro-btn">Nível de Experiência <SlidersHorizontal size={14} /></button>
            <button className="filtro-btn">Cargo <SlidersHorizontal size={14} /></button>
            <button className="filtro-btn">Status <SlidersHorizontal size={14} /></button>
            <button className="filtro-search-btn"><Search size={18} /></button>
          </div>

          {loading ? (
            <p>Carregando mentores...</p>
          ) : (
            <div className="encontrar-mentores-grid">
              {currentMentors.map(profile => (
                <MentorCard
                  key={profile.id}
                  name={profile.name}
                  position={profile.position}
                  skills={profile.skills}
                  anosExperiencia={profile.anosExperiencia}
                  isActive={profile.isActive}
                  avatarUrl={profile.avatarUrl}
                />
              ))}
            </div>
          )}
          
          {/* Paginação Dinâmica */}
          {!loading && totalPages > 1 && (
            <div className="paginacao-container">
              <span className="page-link" onClick={() => paginate(1)}>Primeira</span>
              <span className="page-link" onClick={() => paginate(currentPage - 1)}>Voltar</span>
              
              {/* Exibe números de página simples */}
              {[...Array(totalPages)].map((_, i) => (
                <span 
                  key={i + 1} 
                  className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </span>
              ))}

              <span className="page-link" onClick={() => paginate(currentPage + 1)}>Próxima</span>
              <span className="page-link" onClick={() => paginate(totalPages)}>Última</span>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MentoriasPage;