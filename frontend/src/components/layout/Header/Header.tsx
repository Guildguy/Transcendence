import { Link } from 'react-router-dom'
import './Header.css'
import logo from '../../images/jpg/logo.png'

interface HeaderProps {
  isAuthenticated?: boolean
}

function Header({ isAuthenticated = false }: HeaderProps) {
  return (
    // Adicionamos uma classe dinâmica para mudar o comportamento via CSS
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
          </>
        )}
      </nav>

      {/* Lado direito (apenas quando NÃO autenticado) */}
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
