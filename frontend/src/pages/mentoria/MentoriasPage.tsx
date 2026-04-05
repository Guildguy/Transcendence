import { useState, useEffect, useMemo } from 'react';
import { User, Circle } from 'lucide-react';

// Tipagens e Serviços
import type { MentorCardData } from '../../services/mentorService';
import mentorService from '../../services/mentorService';

// Componentes
import MentorCard from '../../components/common/MentorCard/Mentorcard';
import DropdownList from '../../components/common/Dropdown/Dropdown';

// Estilização
import './MentoriasPage.css';

// Constantes de Filtro Fixo
const OPCOES_EXPERIENCIA = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "+10"];
const OPCOES_STATUS = ["Ativo", "Inativo"];
const OPCOES_DISPONIBILIDADE = ["Com Vagas", "Lista de Espera"];

// Componente Interno para a seção "Meus Mentores"
// Adaptado para os dados que vêm da ConnectionResponseDTO do Java
const MiniMentorCard = ({ name, startDate, status }: { name: string, startDate: string, status: string }) => {
  const isActive = status === 'APPROVED';
  return (
    <div className="mini-mentor-card">
      <div className="mini-avatar-container">
        <User size={32} color="#1f2937" />
      </div>
      <div className="mini-info">
        <h4>{name}</h4>
        <p>Início: {startDate}</p>
        <div className="mini-status">
          <strong>Status:</strong> {isActive ? 'Ativo' : 'Pendente'}
          <Circle size={10} fill={isActive ? "#4ade80" : "#fb7185"} color="transparent" />
        </div>
      </div>
    </div>
  );
};

const MentoriasPage = () => {
  const [mentoresDisponiveis, setMentoresDisponiveis] = useState<MentorCardData[]>([]);
  const [meusMentores, setMeusMentores] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE FILTRO ---
  const [filtroExp, setFiltroExp] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroHabilidade, setFiltroHabilidade] = useState("");
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState(""); // Novo filtro
  
  // --- PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Busca inicial de dados (Mentores da Rede + Minhas Conexões)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Busca todos os mentores para a vitrine
        const todos = await mentorService.getAllMentorsForCards();
        console.log("Mentors loaded from service:", todos);
        console.log("Sample mentor data:", todos[0]);
        setMentoresDisponiveis(todos);

        // 2. Busca conexões do usuário logado (Meus Mentores)
        // OBS: Aqui você deve passar o ID do usuário logado (vindo do seu Contexto ou JWT)
        // Exemplo fixo com ID 1 apenas para ilustração
        const logadoId = 1; 
        const conexoes = await mentorService.getMyMentors(logadoId);
        setMeusMentores(conexoes);

      } catch (error) {
        console.error('Erro ao carregar dados da página de mentorias:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- GERAÇÃO DINÂMICA DE OPÇÕES ---
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

      // Lógica do novo filtro de disponibilidade
      const matchDisponibilidade = filtroDisponibilidade === "" || 
        (filtroDisponibilidade === "Com Vagas" ? mentor.isAvailable : !mentor.isAvailable);

      return matchExp && matchStatus && matchCargo && matchHabilidade && matchDisponibilidade;
    });
  }, [mentoresDisponiveis, filtroExp, filtroStatus, filtroCargo, filtroHabilidade, filtroDisponibilidade]);

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
    setFiltroDisponibilidade("");
    setCurrentPage(1);
  };

  return (
    <div className="mentorias-page-container">
        {/* Seção 1: Meus Mentores (Conexões Reais) */}
        <section className="mentorias-section">
          <h2 className="section-title title-meus-mentores">Meus Mentores</h2>
          <div className="meus-mentores-grid">
            {meusMentores.length > 0 ? (
              meusMentores.map(conn => (
                <MiniMentorCard 
                  key={conn.id} 
                  name={conn.mentorName} 
                  startDate={conn.acceptedAt ? new Date(conn.acceptedAt).toLocaleDateString() : 'Pendente'} 
                  status={conn.status} 
                />
              ))
            ) : (
              <p className="no-results">Você ainda não possui conexões de mentoria.</p>
            )}
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
              onChange={(val) => { setFiltroHabilidade(val); setCurrentPage(1); }}
              isEditing={true}
              placeholder="Todas"
            />

            <DropdownList 
              label="Cargo"
              options={opcoesCargos}
              value={filtroCargo}
              onChange={(val) => { setFiltroCargo(val); setCurrentPage(1); }}
              isEditing={true}
              placeholder="Todos"
            />

            <DropdownList 
              label="Experiência"
              options={OPCOES_EXPERIENCIA}
              value={filtroExp}
              onChange={(val) => { setFiltroExp(val); setCurrentPage(1); }}
              isEditing={true}
              placeholder="Anos"
            />

            <DropdownList 
              label="Vagas"
              options={OPCOES_DISPONIBILIDADE}
              value={filtroDisponibilidade}
              onChange={(val) => { setFiltroDisponibilidade(val); setCurrentPage(1); }}
              isEditing={true}
              placeholder="Disponibilidade"
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
      </div>
  );
};

export default MentoriasPage;