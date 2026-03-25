import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react' // Import opcional para um ícone legal
import './Header.css'
import logo from '../../images/jpg/logo.png'

interface HeaderProps {
  isAuthenticated?: boolean
}

function Header({ isAuthenticated = false }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Limpa todos os dados de autenticação
    localStorage.clear();
    sessionStorage.clear();

    // 2. Redireciona para a página de login
    // Como seu app roda no localhost:5173, o path "/login" é o suficiente
    navigate('/login');
    
    // Opcional: Recarregar a página para resetar estados globais do React
    // window.location.reload(); 
  };

  return (
    <header className={`header ${isAuthenticated ? 'authenticated' : 'unauthenticated'}`}>
      
      <img src={logo} alt="Transcendence logo" className="header-logo" />

      <nav className="header-nav">
        {!isAuthenticated ? (
          <>
            <Link to="/about">Quem somos</Link>
            <Link to="/register?type=MENTOR">Seja Mentor</Link>
            <Link to="/register?type=MENTORADO">Seja Mentorado</Link>
          </>
        ) : (
          <>
            <Link to="/home-logged">Home</Link>
            <Link to="/mentorias">Mentoria</Link>
            <Link to="/profile">Perfil</Link>
            
            {/* Botão de Logout para usuários logados */}
            <button 
              onClick={handleLogout} 
              className="header-logout-btn"
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                gap: '5px',
                color: 'inherit',
                font: 'inherit'
              }}
            >
              <LogOut size={18} />
              Sair
            </button>
          </>
        )}
      </nav>

      {!isAuthenticated && (
        <div className="header-right">
          <Link to="/login" className="header-login-btn">
            Logar
          </Link>
        </div>
      )}
    </header>
  )
}

export default Header