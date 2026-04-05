import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // Enviar o token do Google para o backend
        const response = await loginFetch('/login/google', {
          method: 'POST',
          body: JSON.stringify({
            token: codeResponse.access_token,
          }),
        });

        if (!response.ok) {
          alert('Erro ao autenticar com Google');
          throw new Error('Google authentication failed');
        }

        const data = await response.json();
        
        if (data.token) {
          saveAuthToken(data.token);
          if (data.user_id)
            localStorage.setItem('userId', data.user_id.toString());
          navigate('/home-logged');
        }
      } catch (error) {
        console.error('Erro na autenticação com Google:', error);
        alert('Falha ao fazer login com Google');
      }
    },
    onError: () => {
      alert('Erro ao conectar com Google');
    },
    flow: 'implicit',
  });

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

      <Link to="/Forgot" className="auth-link">
        Esqueceu a sua senha?
      </Link>

      <div className="social-buttons">
        <button type="button" className="social-btn" onClick={() => handleGoogleLogin()}>
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