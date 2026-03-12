import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import "./PresentationText.css";

interface UserData {
  id: number;
  email: string;
  presentationText?: string;
}

interface Props {
  initialUser: UserData | null;
  isEditable?: boolean; // Nova prop opcional
}

const PresentationText: React.FC<Props> = ({
  initialUser,
  isEditable = false,
}) => {
  const [text, setText] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (initialUser) {
      setText(initialUser.presentationText || "");
    }
  }, [initialUser]);

  const handleSave = async () => {
    if (!initialUser) return;

    setSaving(true);
    try {
      const response = await fetch("http://localhost:8080/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...initialUser,
          presentationText: text,
        }),
      });

      // Verificamos se a resposta foi ok (status 200-299)
      if (response.ok) {
        setIsEditing(false); // <--- ISSO faz o componente voltar ao estado original
        console.log("Salvo com sucesso!");
      } else {
        // Caso o backend retorne erro (ex: 422 ou 500)
        console.error("Erro ao salvar: Status", response.status);
        alert("Não foi possível salvar as alterações.");
      }
    } catch (error) {
      console.error("Erro de conexão ao salvar:", error);
      setIsEditing(false); // qnd conectar o back remover esta linha
    } finally {
      setSaving(false);
    }
  };

  const isWaitingData = !initialUser;

  return (
    <div className="presentation-container">
      <div className="presentation-header">
        <label className="presentation-label">Carta apresentação:</label>

        {/* O lápis SÓ aparece se isEditable for true E os dados já existirem */}
        {isEditable && !isWaitingData && (
          <button
            type="button"
            className="presentation-edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Pencil size={18} color={isEditing ? "#6366f1" : "#6b7280"} />
          </button>
        )}
      </div>

      <div className={`presentation-card ${isEditing ? "editing-mode" : ""}`}>
        <textarea
          className="presentation-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          // Se não for editável, o campo fica sempre travado
          disabled={!isEditing || !isEditable || isWaitingData}
          placeholder={isWaitingData ? "" : "Nenhuma apresentação disponível."}
        />

        {/* Botão salvar só aparece se for editável e estiver em modo de edição */}
        {isEditable && isEditing && (
          <button
            className="presentation-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "..." : "Salvar"}
          </button>
        )}
      </div>
    </div>
  );
};

export default PresentationText;
