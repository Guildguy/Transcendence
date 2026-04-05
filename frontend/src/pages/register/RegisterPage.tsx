import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './RegisterPage.css'
import logo_42 from '../../components/images/jpg/logo-42.png'
import logo_google from '../../components/images/jpg/logo-google.png'
import { loginFetch, saveAuthToken, apiFetch } from '../../services/api'

type Errors = {
  name?: string
  phone?: string
  email?: string
  confirmEmail?: string
  password?: string
  confirmPassword?: string
  privacy?: string
  terms?: string
  profileType?: string
}

const ALLOWED_PROFILE_TYPES = ['MENTOR', 'MENTORADO'] as const

function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [name, setName] = useState('')
  const [phoneNumber, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [profileType, setProfileType] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const type = searchParams.get('type')?.toUpperCase()
    if (type && ALLOWED_PROFILE_TYPES.includes(type as (typeof ALLOWED_PROFILE_TYPES)[number])) {
      setProfileType(type)
      return
    }
    setProfileType('')
  }, [searchParams]);

  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    if (numbers.length < 11) return numbers
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhone(e.target.value))
  }

  function validate(): boolean {
    const newErrors: Errors = {}

    if (!name) newErrors.name = 'Nome completo é obrigatório.'
    if (!profileType) {
      newErrors.profileType = 'Tipo de perfil é obrigatório. Abra o cadastro por "Seja Mentor" ou "Seja Mentorado".'
    } else if (!ALLOWED_PROFILE_TYPES.includes(profileType as (typeof ALLOWED_PROFILE_TYPES)[number])) {
      newErrors.profileType = 'Tipo de perfil inválido.'
    }
    if (!phoneNumber) {
      newErrors.phone = 'Celular é obrigatório.'
    } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(phoneNumber)) {
      newErrors.phone = 'Use o formato (xx) xxxxx-xxxx.'
    }
    if (!email) newErrors.email = 'E-mail é obrigatório.'
    if (!confirmEmail) newErrors.confirmEmail = 'Confirme o e-mail.'
    if (email && confirmEmail && email !== confirmEmail)
      newErrors.confirmEmail = 'Os e-mails não coincidem.'
    if (!password) newErrors.password = 'Senha é obrigatória.'
    if (!confirmPassword) newErrors.confirmPassword = 'Confirme a senha.'
    if (password && confirmPassword && password !== confirmPassword)
      newErrors.confirmPassword = 'As senhas não coincidem.'
    if (!acceptPrivacy) newErrors.privacy = 'Você deve aceitar a Política de Privacidade.'
    if (!acceptTerms) newErrors.terms = 'Você deve aceitar os Termos de Uso.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true)

    const payload = {
      name,
      profileType,
      phoneNumber,
      email,
      password,
      status: true
    };

    try {
      // 1. Cria o usuário + profile
      const response = await loginFetch('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const responseErrors = Array.isArray(data)
          ? data
          : Array.isArray(data?.result?.errors)
            ? data.result.errors
            : []

        if (responseErrors.length > 0) {
          const message = responseErrors
            .map((item: any) => item?.message ?? item?.erroMsg ?? String(item))
            .join(', ')
          alert('Erro ao cadastrar usuário: ' + message)
        } else {
          alert('Erro ao cadastrar usuário. Verifique os dados e tente novamente.')
        }

        throw new Error('Falha ao cadastrar usuário');
      }

      // 2. Login automático
      const loginResponse = await loginFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        alert('Erro ao fazer login após cadastro');
        throw new Error('Login falhou após cadastro');
      }

      const loginData = await loginResponse.json();
      const token = loginData.token;
      const userId = loginData.user_id;

      if (token)
        saveAuthToken(token);

      // userId do login é a fonte de verdade
      if (userId)
        localStorage.setItem('userId', userId.toString());

      // 3. Dispara PROFILE_COMPLETED — token já salvo, apiFetch já pega automaticamente
      if (token && userId) {
        try {
          await apiFetch('/gamification/events', {
            method: 'POST',
            body: JSON.stringify({
              userId: userId,
              eventType: 'PROFILE_COMPLETED'
            })
          })
        } catch {
          // não bloqueia o fluxo se gamificação falhar
        }
      }

      navigate('/home-logged');

    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Não foi possível concluir o cadastro agora. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="register-form-wrapper">
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome Completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="input-error">{errors.name}</span>}

        <input
          type="tel"
          placeholder="Celular"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className={errors.phone ? 'error' : ''}
        />
        {errors.phone && <span className="input-error">{errors.phone}</span>}

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
        {errors.profileType && <span className="input-error">{errors.profileType}</span>}

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="input-error">{errors.email}</span>}

        <input
          type="email"
          placeholder="Confirmação de E-mail"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className={errors.confirmEmail ? 'error' : ''}
        />
        {errors.confirmEmail && <span className="input-error">{errors.confirmEmail}</span>}

        <input
          type="password"
          placeholder="Criação de Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="input-error">{errors.password}</span>}

        <input
          type="password"
          placeholder="Confirmação de Senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}

        <label className="checkbox">
          <input
            type="checkbox"
            checked={acceptPrivacy}
            onChange={(e) => setAcceptPrivacy(e.target.checked)}
          />
          <span>Concordo com a Política de Privacidade</span>
        </label>
        {errors.privacy && <span className="input-error">{errors.privacy}</span>}

        <label className="checkbox">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          <span>Concordo com os Termos de Uso</span>
        </label>
        {errors.terms && <span className="input-error">{errors.terms}</span>}

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </main>
  )
}

export default RegisterPage