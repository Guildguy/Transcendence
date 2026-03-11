import React, { useState, useEffect } from "react";
import { Pencil, User, Save, Trash2 } from "lucide-react";
import "./ProfilePage.css";
import InputGroup from "../../components/common/InputGroup/InputGroup";

// Interface alinhada com o banco de dados
interface UserData {
  id?: string;
  nome: string;
  email: string;
  cargo: string;
  presentationText: string;
  anosExperiencia: string;
  github: string;
  linkedin: string;
  instagram: string;
  telefone: string;
}

const ProfilePage = () => {
  const [abaAtiva, setAbaAtiva] = useState("gerais");
  const [isEditing, setIsEditing] = useState(false);

  // 1. Estado inicial com strings vazias para evitar erros de "null" e permitir placeholders
  const [userData, setUserData] = useState<UserData>({
    nome: "",
    email: "",
    cargo: "",
    presentationText: "",
    anosExperiencia: "",
    github: "",
    linkedin: "",
    instagram: "",
    telefone: "",
  });

  // Estado para restaurar os dados caso o usuário clique no (X) cancelar
  const [backupData, setBackupData] = useState<UserData | null>(null);

  // Lógica de Carregamento
  useEffect(() => {
    const loadFullProfile = async () => {
      try {
        const [resUser, resProfile] = await Promise.all([
          fetch("http://localhost:8080/users/1"),
          fetch("http://localhost:8080/profile/1"),
        ]);

        if (resUser.ok && resProfile.ok) {
          const dataUser = await resUser.json();
          const dataProfile = await resProfile.json();

          const unifiedData: UserData = {
            ...dataUser,
            ...dataProfile,
          };

          setUserData(unifiedData);
          setBackupData(unifiedData);
        } else {
          throw new Error("Dados não encontrados no servidor");
        }
      } catch (error) {
        console.warn(
          "Backend offline ou vazio, carregando Mock para testes...",
        );

        // Mantenha o mock aqui para testes visuais; apague este bloco quando o backend estiver 100%
        const mockUser: UserData = {
          id: "1",
          nome: "Beyoncé Knowles",
          cargo: "Queen B",
          email: "Beyonce@RocNation.com",
          presentationText:
            "Beyoncé Giselle Knowles-Carter é uma figura cultural proeminente...",
          anosExperiencia: "30",
          github: "github.com/beyonce",
          linkedin: "linkedin.com/in/beyonce",
          instagram: "@beyonce",
          telefone: "11999999999",
        };

        setUserData(mockUser);
        setBackupData(mockUser);
      }
    };

    loadFullProfile();
  }, []);

  // função de save modo mock
  const handleSaveAll = async () => {
    if (!userData) return;

    console.log("Dados salvos no Mock:", userData);

    setBackupData(userData);

    setIsEditing(false);
  };

  // Função de Salvar backend funcionado
  /*const handleSaveAll = async () => {
    try {
      const userPayload = { nome: userData.nome, email: userData.email };
      const profilePayload = {
        cargo: userData.cargo,
        presentationText: userData.presentationText,
        anosExperiencia: userData.anosExperiencia,
        github: userData.github,
        linkedin: userData.linkedin,
        instagram: userData.instagram,
        telefone: userData.telefone,
      };

      // Chamadas PUT com headers de JSON
      await Promise.all([
        fetch(`http://localhost:8080/users/${userData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userPayload),
        }),
        fetch(`http://localhost:8080/profile/${userData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profilePayload),
        })
      ]);

      setBackupData(userData);
      setIsEditing(false);
      alert("Alterações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      console.log("Erro ao conectar com o servidor.");
    }
  };*/

  // Função de Cancelar
  const handleCancel = () => {
    if (backupData) {
      setUserData(backupData);
    }
    setIsEditing(false);
  };
  //Lógica de troca de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("Por favor, preencha todos os campos de senha.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/users/${userData.id}/update-password`,
        {
          method: "PATCH", // Ou PUT, dependendo da sua Controller Java
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: newPassword,
          }),
        },
      );

      if (response.ok) {
        alert("Senha atualizada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
      } else if (response.status === 401 || response.status === 403) {
        // O Java geralmente retorna 401 Unauthorized se a senha atual estiver errada
        alert("Senha atual não coincide.");
      } else {
        // Trata erro de validação (Passay)
        const errorData = await response.json();
        alert(
          errorData.message ||
            "A nova senha não segue a política de segurança.",
        );
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <div className="perfil-avatar">
          <User size={64} color="#e5e7eb" />
        </div>
        <div className="perfil-badges">
          <div className="perfil-badge">Level de Mentoria</div>
          <div className="perfil-badge">XP</div>
        </div>
      </div>

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

      <div className="perfil-conteudo">
        <div className="perfil-grid">
          <div className="perfil-coluna">
            <div className="perfil-titulo-secao">
              <span className="perfil-tag-titulo">
                {abaAtiva === "gerais" ? "Pessoa Mentora" : "Dados de contato"}
              </span>

              {isEditing ? (
                <div className="botoes-edicao-topo">
                  <Save
                    size={22}
                    className="perfil-icone-salvar"
                    onClick={handleSaveAll}
                    title="Salvar"
                  />
                  <Trash2
                    size={22}
                    className="perfil-icone-cancelar"
                    onClick={handleCancel}
                    title="Descartar alterações"
                  />
                </div>
              ) : (
                <Pencil
                  size={18}
                  className="perfil-icone-editar"
                  onClick={() => setIsEditing(true)}
                  title="Editar"
                />
              )}
            </div>

            {abaAtiva === "gerais" ? (
              <>
                <InputGroup
                  placeholder="Nome Completo"
                  value={userData.nome}
                  isEditing={isEditing}
                  onChange={(val) => setUserData({ ...userData, nome: val })}
                />
                <InputGroup
                  placeholder="Cargo"
                  value={userData.cargo}
                  isEditing={isEditing}
                  onChange={(val) => setUserData({ ...userData, cargo: val })}
                />
                <InputGroup
                  label="Carta apresentação:"
                  value={userData.presentationText}
                  isEditing={isEditing}
                  isTextArea={true}
                  onChange={(val) =>
                    setUserData({ ...userData, presentationText: val })
                  }
                />
                <InputGroup
                  label="Quantidade de anos de experiência"
                  value={userData.anosExperiencia}
                  isEditing={isEditing}
                  isNumeric={true}
                  onChange={(val) =>
                    setUserData({ ...userData, anosExperiencia: val })
                  }
                />
              </>
            ) : (
              <>
                <InputGroup
                  placeholder="Github"
                  value={userData.github}
                  isEditing={isEditing}
                  onChange={(val) => setUserData({ ...userData, github: val })}
                />
                <InputGroup
                  placeholder="Linkedin"
                  value={userData.linkedin}
                  isEditing={isEditing}
                  onChange={(val) =>
                    setUserData({ ...userData, linkedin: val })
                  }
                />
                <InputGroup
                  placeholder="Instagram"
                  value={userData.instagram}
                  isEditing={isEditing}
                  onChange={(val) =>
                    setUserData({ ...userData, instagram: val })
                  }
                />
                <InputGroup
                  placeholder="E-mail"
                  value={userData.email}
                  isEditing={isEditing}
                  onChange={(val) => setUserData({ ...userData, email: val })}
                />
                <InputGroup
                  placeholder="Telefone"
                  value={userData.telefone}
                  isEditing={isEditing}
                  isNumeric={true}
                  onChange={(val) =>
                    setUserData({ ...userData, telefone: val })
                  }
                />
              </>
            )}
          </div>

          <div className="perfil-coluna">
            {abaAtiva === "gerais" ? (
              <div className="perfil-habilidades">
                <h3 className="perfil-habilidades-titulo">
                  Habilidades apresentadas para mentorar
                </h3>
                <div className="perfil-habilidades-lista">
                  {["React", "MongoDB", "Java", "UX"].map((s) => (
                    <span key={s} className="perfil-habilidade-tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="perfil-caixa-senha">
                <h3>Alterar a Senha:</h3>
                <input
                  type="password"
                  placeholder="Senha Atual"
                  className="perfil-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Nova Senha"
                  className="perfil-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                {/* Pequeno lembrete visual das regras que você definiu no Java (Passay) */}
                <p className="senha-dica">
                  Mínimo 8 caracteres, com maiúscula, número e símbolo.
                </p>

                <button
                  className="perfil-botao-salvar"
                  onClick={handleUpdatePassword}
                >
                  Salvar Nova Senha
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
