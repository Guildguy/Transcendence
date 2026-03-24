import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo_42 from '../../components/images/jpg/logo-42.png'
import logo_google from '../../components/images/jpg/logo-google.png'
import { loginFetch, saveAuthToken } from '../../services/api';

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      email,
      password,
    };

    try {
      const response = await loginFetch('/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        alert('Credenciais inválidas. Por favor, verifique seu email e senha.');
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      const token = data.token;
      
      if (token)
        saveAuthToken(token);
      
      if (data.user_id)
        localStorage.setItem('userId', data.user_id.toString());
      navigate('/home-logged');
      
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <p className="auth-description">
        Preencha seus dados de acesso para entrar
      </p>

      <input
        type="email" // Alterado para email para validação nativa do browser
        placeholder="e-mail"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)} // Atualiza o estado
      />

      <input
        type="password"
        placeholder="Insira a sua senha"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)} // Atualiza o estado
      />

      <a href="#" className="auth-link">
        Esqueceu a sua senha?
      </a>

      <div className="social-buttons">
        <button type="button" className="social-btn">
          <img src={logo_google} alt="Google" />
          <span>Continuar com Google</span>
        </button>

        <button type="button" className="social-btn">
          <img src={logo_42} alt="42" />
          <span>Continuar com a 42</span>
        </button>
      </div>

      <button type="submit" className="auth-submit">
        Entrar
      </button>
    </form>
  )
}

export default LoginForm;