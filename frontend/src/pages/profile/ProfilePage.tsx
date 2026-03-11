import React, { useState, useEffect } from "react";
import { Pencil, User } from "lucide-react";
import "./ProfilePage.css";
import PresentationText from "../../components/common/PresentationText/PresentationText";

// Interface para tipar o usuário vindo do backend
interface UserData {
  id: number;
  email: string;
  presentationText?: string;
  // Adicione outros campos conforme sua Entity Java
}
const ProfilePage = () => {
  const [abaAtiva, setAbaAtiva] = useState("gerais");
  const [userData, setUserData] = useState<UserData | null>(null);

  // habilitar qnd conectar com o backend e tirar o fake
  /*useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch("http://localhost:8080/users");
        const data = await response.json();
        // Pegando o primeiro usuário da lista conforme seu UserController
        if (data && data.length > 0) {
          setUserData(data[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
      }
    };

    loadUserData();
  }, []);*/

  useEffect(() => {
    // Simulação de dados enquanto o backend está offline
    const mockUser: UserData = {
      id: 1,
      email: "desenvolvedora@teste.com",
      presentationText:
        "Beyoncé Giselle Knowles-Carter,é uma cantora, compositora, atriz e empresária norte-americana. Referida como Queen Bey, ela é amplamente reconhecida por seu talento artístico, voz e apresentações ao vivo. Suas contribuições para a música e a mídia visual, bem como suas apresentações em concertos a converteram em uma figura cultural proeminente do século XXI.",
    };

    // Simulando um pequeno atraso de rede (opcional)
    setTimeout(() => {
      setUserData(mockUser);
    }, 500);
  }, []);

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
          onClick={() => setAbaAtiva("gerais")}
          className={`perfil-tab-btn ${abaAtiva === "gerais" ? "ativa" : "inativa"}`}
        >
          Dados Gerais
        </button>
        <button
          onClick={() => setAbaAtiva("pessoais")}
          className={`perfil-tab-btn ${abaAtiva === "pessoais" ? "ativa" : "inativa"}`}
        >
          Dados Pessoais
        </button>
      </div>

      {/* Área de Conteúdo das Abas */}
      <div className="perfil-conteudo">
        {/* CONTEÚDO: DADOS GERAIS */}
        {abaAtiva === "gerais" && (
          <div className="perfil-grid">
            <div className="perfil-coluna">
              <div className="perfil-titulo-secao">
                <span className="perfil-tag-titulo">Pessoa Mentora</span>
                <Pencil size={18} className="perfil-icone-editar" />
              </div>

              <input
                type="text"
                placeholder="Nome Completo"
                className="perfil-input"
              />
              <input type="text" placeholder="Cargo" className="perfil-input" />

              <PresentationText initialUser={userData} isEditable={true} />

              <label className="perfil-label">
                Quantidade de anos de experiência
              </label>
              <input type="text" className="perfil-input perfil-input-curto" />
            </div>

            <div className="perfil-habilidades">
              <h3 className="perfil-habilidades-titulo">
                Habilidades apresentadas para
                <br />
                mentorar
              </h3>
              <div className="perfil-habilidades-lista">
                {[
                  "React",
                  "Banco de dados",
                  "UX",
                  "Typescript",
                  "Teste A/B",
                  "CSS",
                  "HTML",
                  "Figma",
                ].map((skill) => (
                  <span key={skill} className="perfil-habilidade-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO: DADOS PESSOAIS */}
        {abaAtiva === "pessoais" && (
          <div className="perfil-grid">
            <div className="perfil-coluna">
              <div className="perfil-titulo-secao">
                <span className="perfil-tag-titulo">Dados de contato</span>
                <Pencil size={18} className="perfil-icone-editar" />
              </div>

              <input
                type="text"
                placeholder="Github"
                className="perfil-input"
              />
              <input
                type="text"
                placeholder="Linkedin"
                className="perfil-input"
              />
              <input
                type="text"
                placeholder="Instagram"
                className="perfil-input"
              />
              <input
                type="email"
                placeholder="E-mail"
                className="perfil-input"
              />
              <input
                type="tel"
                placeholder="Telefone de contato"
                className="perfil-input"
              />
            </div>

            <div className="perfil-coluna">
              <div className="perfil-caixa-senha">
                <h3>Alterar a Senha:</h3>
                <input
                  type="password"
                  placeholder="Senha Atual"
                  className="perfil-input"
                />
                <input
                  type="password"
                  placeholder="Nova Senha"
                  className="perfil-input"
                />
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
