import { useState, useEffect, useMemo } from 'react';
import { Search, User, Circle } from 'lucide-react';
import type { MentorCardData } from '../../services/mentorService';
import mentorService from '../../services/mentorService';
import MentorCard from '../../components/common/MentorCard/Mentorcard';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import DropdownList from '../../components/common/Dropdown/Dropdown';
import './MentoriasPage.css';

// 1. Constantes fixas
const OPCOES_EXPERIENCIA = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "+10"];
const OPCOES_STATUS = ["Ativo", "Inativo"];

const MiniMentorCard = ({ name, startDate, isActive }: { name: string, startDate: string, isActive: boolean }) => (
  <div className="mini-mentor-card">
    <div className="mini-avatar-container">
      <User size={32} color="#1f2937" />
    </div>
    <div className="mini-info">
      <h4>{name}</h4>
      <p>Data de início: {startDate}</p>
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
  
  // --- ESTADOS DE FILTRO ---
  const [filtroExp, setFiltroExp] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroHabilidade, setFiltroHabilidade] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchMentores = async () => {
      try {
        const mentores = await mentorService.getAllMentorsForCards();
        setMentoresDisponiveis(mentores);
      } catch (error) {
        console.error('Erro ao buscar mentores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentores();
  }, []);

  // --- GERAÇÃO DINÂMICA DE OPÇÕES (Cargos e Skills que existem na lista) ---
  const opcoesCargos = useMemo(() => 
    Array.from(new Set(mentoresDisponiveis.map(m => m.position))).sort(),
  [mentoresDisponiveis]);

  const opcoesHabilidades = useMemo(() => 
    Array.from(new Set(mentoresDisponiveis.flatMap(m => m.skills.map(s => s.name)))).sort(),
  [mentoresDisponiveis]);

  // --- LÓGICA DE FILTRAGEM COMBINADA ---
  const mentoresFiltrados = mentoresDisponiveis.filter(mentor => {
    const matchExp = filtroExp === "" || 
      (filtroExp === "+10" ? mentor.anosExperiencia >= 10 : mentor.anosExperiencia === parseInt(filtroExp));
    
    const matchStatus = filtroStatus === "" || 
      (filtroStatus === "Ativo" ? mentor.isActive : !mentor.isActive);

    const matchCargo = filtroCargo === "" || mentor.position === filtroCargo;

    const matchHabilidade = filtroHabilidade === "" || 
      mentor.skills.some(s => s.name === filtroHabilidade);

    return matchExp && matchStatus && matchCargo && matchHabilidade;
  });

  // --- PAGINAÇÃO ---
  const totalPages = Math.ceil(mentoresFiltrados.length / itemsPerPage);
  const currentMentors = mentoresFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  const resetarFiltros = () => {
    setFiltroExp("");
    setFiltroStatus("");
    setFiltroCargo("");
    setFiltroHabilidade("");
    setCurrentPage(1);
  };

  return (
    <div className="page-wrapper">
      <Header isAuthenticated={true} />
      
      <main className="mentorias-page-container">
        <section className="mentorias-section">
          <h2 className="section-title">Encontrar Mentores</h2>
          
          <div className="filtros-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            
            <DropdownList 
              label="Habilidades"
              options={opcoesHabilidades}
              value={filtroHabilidade}
              isEditing={true}
              onChange={(val) => { setFiltroHabilidade(val); setCurrentPage(1); }}
              placeholder="Todas"
            />

            <DropdownList 
              label="Cargo"
              options={opcoesCargos}
              value={filtroCargo}
              isEditing={true}
              onChange={(val) => { setFiltroCargo(val); setCurrentPage(1); }}
              placeholder="Todos"
            />

            <DropdownList 
              label="Experiência"
              options={OPCOES_EXPERIENCIA}
              value={filtroExp}
              isEditing={true}
              onChange={(val) => { setFiltroExp(val); setCurrentPage(1); }}
              placeholder="Anos"
            />

            <DropdownList 
              label="Status"
              options={OPCOES_STATUS}
              value={filtroStatus}
              isEditing={true}
              onChange={(val) => { setFiltroStatus(val); setCurrentPage(1); }}
              placeholder="Todos"
            />

            <button className="limpar-filtros-btn" onClick={resetarFiltros}>
              Limpar Filtros
            </button>
          </div>

          {loading ? (
            <p>Carregando mentores...</p>
          ) : (
            <div className="encontrar-mentores-grid">
              {currentMentors.length > 0 ? (
                currentMentors.map(profile => (
                  <MentorCard key={profile.id} {...profile} />
                ))
              ) : (
                <p>Nenhum mentor encontrado.</p>
              )}
            </div>
          )}
          
          {/* Paginação (omitida aqui por brevidade, manter a mesma do código anterior) */}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MentoriasPage;