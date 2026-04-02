import { useState, useEffect, useMemo } from 'react';
import { User, Circle } from 'lucide-react';

// Tipagens e Serviços
import type { MentorCardData } from '../../services/mentorService';
import mentorService from '../../services/mentorService';

// Componentes
import MentorCard from '../../components/common/MentorCard/Mentorcard';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import DropdownList from '../../components/common/Dropdown/Dropdown';

// Estilização
import './MentoriasPage.css';

// 1. Constantes de Filtro Fixo
const OPCOES_EXPERIENCIA = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "+10"];
const OPCOES_STATUS = ["Ativo", "Inativo"];

// Componente Interno para a seção "Meus Mentores"
const MiniMentorCard = ({ name, startDate, isActive }: { name: string, startDate: string, isActive: boolean }) => (
  <div className="mini-mentor-card">
    <div className="mini-avatar-container">
      <User size={32} color="#1f2937" />
    </div>
    <div className="mini-info">
      <h4>{name}</h4>
      <p>Início: {startDate}</p>
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

  // --- MOCK: SEUS MENTORES (Pode ser substituído por uma chamada de API futura) ---
  const meusMentores = [
    { id: 101, name: "Marcelo Dias", startDate: "03/03/2026", isActive: true },
    { id: 102, name: "Ana Silva", startDate: "05/03/2026", isActive: true },
  ];
  
  // --- ESTADOS DE FILTRO ---
  const [filtroExp, setFiltroExp] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroHabilidade, setFiltroHabilidade] = useState("");
  
  // --- PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Busca inicial de mentores (Usando o Service atualizado com apiFetch/JWT)
  useEffect(() => {
    const fetchMentores = async () => {
      setLoading(true);
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

  // --- GERAÇÃO DINÂMICA DE OPÇÕES BASEADA NO QUE VEM DO BACKEND ---
  const opcoesCargos = useMemo(() => 
    Array.from(new Set(mentoresDisponiveis.map(m => m.position))).sort(),
  [mentoresDisponiveis]);

  const opcoesHabilidades = useMemo(() => 
    Array.from(new Set(mentoresDisponiveis.flatMap(m => m.skills.map(s => s.name)))).sort(),
  [mentoresDisponiveis]);

  // --- LÓGICA DE FILTRAGEM ---
  const mentoresFiltrados = useMemo(() => {
    return mentoresDisponiveis.filter(mentor => {
      const matchExp = filtroExp === "" || 
        (filtroExp === "+10" ? mentor.anosExperiencia >= 10 : mentor.anosExperiencia === parseInt(filtroExp));
      
      const matchStatus = filtroStatus === "" || 
        (filtroStatus === "Ativo" ? mentor.isActive : !mentor.isActive);

      const matchCargo = filtroCargo === "" || mentor.position === filtroCargo;

      const matchHabilidade = filtroHabilidade === "" || 
        mentor.skills.some(s => s.name === filtroHabilidade);

      return matchExp && matchStatus && matchCargo && matchHabilidade;
    });
  }, [mentoresDisponiveis, filtroExp, filtroStatus, filtroCargo, filtroHabilidade]);

  // --- CONTROLE DE PAGINAÇÃO ---
  const totalPages = Math.ceil(mentoresFiltrados.length / itemsPerPage);
  const currentMentors = mentoresFiltrados.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

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
        {/* Seção 1: Meus Mentores */}
        <section className="mentorias-section">
          <h2 className="section-title title-meus-mentores">Meus Mentores</h2>
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

        <hr className="section-divider" />

        {/* Seção 2: Encontrar Mentores */}
        <section className="mentorias-section">
          <h2 className="section-title">Encontrar Mentores</h2>
          
          <div className="filtros-container">
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
            <div className="loading-state">
              <p>Buscando mentores na rede...</p>
            </div>
          ) : (
            <>
              <div className="encontrar-mentores-grid">
                {currentMentors.length > 0 ? (
                  currentMentors.map(mentor => (
                    <MentorCard key={mentor.id} {...mentor} />
                  ))
                ) : (
                  <p className="no-results">Nenhum mentor encontrado com os filtros selecionados.</p>
                )}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }}
                  >
                    Anterior
                  </button>
                  <span className="page-info">Página {currentPage} de {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MentoriasPage;