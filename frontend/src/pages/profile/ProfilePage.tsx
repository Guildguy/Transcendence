import React, { useState } from 'react';
import { Pencil, User } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [abaAtiva, setAbaAtiva] = useState('gerais');

  return (
    <div className="perfil-container">
      {/* Seção Superior - Foto e Níveis */}
      <div className="perfil-header">
        <div className="perfil-avatar">
          <User size={64} color="#e5e7eb" />
        </div>
        
        <div className="perfil-badges">
          <div className="perfil-badge">Level de Mentoria</div>
          <div className="perfil-badge">XP</div>
        </div>
      </div>

      {/* Navegação das Abas */}
      <div className="perfil-tabs-nav">
        <button
          onClick={() => setAbaAtiva('gerais')}
          className={`perfil-tab-btn ${abaAtiva === 'gerais' ? 'ativa' : 'inativa'}`}
        >
          Dados Gerais
        </button>
        <button
          onClick={() => setAbaAtiva('pessoais')}
          className={`perfil-tab-btn ${abaAtiva === 'pessoais' ? 'ativa' : 'inativa'}`}
        >
          Dados Pessoais
        </button>
      </div>

      {/* Área de Conteúdo das Abas */}
      <div className="perfil-conteudo">
        
        {/* CONTEÚDO: DADOS GERAIS */}
        {abaAtiva === 'gerais' && (
          <div className="perfil-grid">
            <div className="perfil-coluna">
              <div className="perfil-titulo-secao">
                <span className="perfil-tag-titulo">Pessoa Mentora</span>
                <Pencil size={18} className="perfil-icone-editar" />
              </div>

              <input type="text" placeholder="Nome Completo" className="perfil-input" />
              <input type="text" placeholder="Cargo" className="perfil-input" />

              <label className="perfil-label">Carta de apresentação:</label>
              <textarea className="perfil-textarea"></textarea>

              <label className="perfil-label">Quantidade de anos de experiência</label>
              <input type="text" className="perfil-input perfil-input-curto" />
            </div>

            <div className="perfil-habilidades">
              <h3 className="perfil-habilidades-titulo">
                Habilidades apresentadas para<br />mentorar
              </h3>
              <div className="perfil-habilidades-lista">
                {['React', 'Banco de dados', 'UX', 'Typescript', 'Teste A/B', 'CSS', 'HTML', 'Figma'].map((skill) => (
                  <span key={skill} className="perfil-habilidade-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO: DADOS PESSOAIS */}
        {abaAtiva === 'pessoais' && (
          <div className="perfil-grid">
            <div className="perfil-coluna">
              <div className="perfil-titulo-secao">
                <span className="perfil-tag-titulo">Dados de contato</span>
                <Pencil size={18} className="perfil-icone-editar" />
              </div>

              <input type="text" placeholder="Github" className="perfil-input" />
              <input type="text" placeholder="Linkedin" className="perfil-input" />
              <input type="text" placeholder="Instagram" className="perfil-input" />
              <input type="email" placeholder="E-mail" className="perfil-input" />
              <input type="tel" placeholder="Telefone de contato" className="perfil-input" />
            </div>

            <div className="perfil-coluna">
              <div className="perfil-caixa-senha">
                <h3>Alterar a Senha:</h3>
                <input type="password" placeholder="Senha Atual" className="perfil-input" />
                <input type="password" placeholder="Nova Senha" className="perfil-input" />
                <button className="perfil-botao-salvar">
                  Salvar Nova Senha
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;