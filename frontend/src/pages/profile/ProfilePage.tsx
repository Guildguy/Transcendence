import { useState } from 'react'
import './ProfilePage.css'

function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'gerais' | 'pessoais'>('gerais')

  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    bio: '',
    experiencia: '',
    github: '',
    linkedin: '',
    instagram: '',
    email: '',
    telefone: '',
    senhaAtual: '',
    novaSenha: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-inner">

        {/* HEADER */}
        <div className="profile-header">
          <div className="avatar" />
          <div className="profile-level">
            <div className="level-pill">Level de Mentoria</div>
            <div className="level-pill">XP</div>
          </div>
        </div>

        {/* TABS */}
        <div className="profile-tabs">
          <button
            className={activeTab === 'gerais' ? 'active' : ''}
            onClick={() => setActiveTab('gerais')}
            type="button"
          >
            Dados Gerais
          </button>

          <button
            className={activeTab === 'pessoais' ? 'active' : ''}
            onClick={() => setActiveTab('pessoais')}
            type="button"
          >
            Dados Pessoais
          </button>
        </div>

        {/* CARD */}
        <div className="profile-card">
          {activeTab === 'gerais' && (
            <div className="profile-grid">
              <div className="col-left">
                <h3 className="badge">Pessoa Mentora</h3>

                <input name="nome" placeholder="Nome Completo" onChange={handleChange} />
                <input name="cargo" placeholder="Cargo" onChange={handleChange} />

                <label>Carta apresentação:</label>
                <textarea name="bio" onChange={handleChange} />

                <label>Quantidade de anos de experiência</label>
                <input type="number" name="experiencia" onChange={handleChange} />
              </div>

              <div className="col-right">
                <h3>Habilidades apresentadas para mentorar</h3>
                <div className="skills">
                  {['React','Banco de dados','UX','Typescript','Teste A/B','CSS','HTML','Figma']
                    .map(skill => (
                      <span key={skill} className="skill">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pessoais' && (
            <div className="profile-grid">
              <div className="col-left">
                <h3 className="badge">Dados de contato</h3>

                <input name="github" placeholder="Github" onChange={handleChange} />
                <input name="linkedin" placeholder="Linkedin" onChange={handleChange} />
                <input name="instagram" placeholder="Instagram" onChange={handleChange} />
                <input name="email" placeholder="E-mail" onChange={handleChange} />
                <input name="telefone" placeholder="Telefone de contato" onChange={handleChange} />
              </div>

              <div className="password-box">
                <h4>Alterar a Senha</h4>

                <input type="password" name="senhaAtual" placeholder="Senha Atual" onChange={handleChange} />
                <input type="password" name="novaSenha" placeholder="Nova Senha" onChange={handleChange} />

                <button className="primary-btn">Salvar Nova Senha</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ProfilePage