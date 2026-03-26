import React from "react";
import "./Dropdown.css"; 

interface DropdownListProps {
  label?: string;
  options: string[]; 
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
}

const DropdownList: React.FC<DropdownListProps> = ({
  label,
  options,
  value,
  isEditing,
  onChange,
  placeholder
}) => {
  // O "return" precisa estar aqui!
  return (
    <div className={`dropdown-container ${isEditing ? "editing-mode" : ""}`}>
      {label && <label className="dropdown-label">{label}</label>}
      
      {!isEditing ? (
        // Modo Estático (Efeito "Pílula" da imagem)
        <div className="dropdown-static-value">
          {value || "Não informado"}
        </div>
      ) : (
        // Modo Edição (Seu padrão custom-input)
        <select
          className="custom-input dropdown-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>{placeholder || "Selecione..."}</option>
          {options.map((prof, i) => (
            <option key={i} value={prof}>{prof}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default DropdownList;