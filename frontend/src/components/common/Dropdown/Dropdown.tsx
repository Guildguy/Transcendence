import React, { useState, useRef, useEffect } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtra as opções conforme a busca
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`dropdown-container ${isEditing ? "editing-mode" : ""}`} ref={dropdownRef}>
      {label && <label className="dropdown-label">{label}</label>}
      
      {!isEditing ? (
        <div className="dropdown-static-value">{value || "Não informado"}</div>
      ) : (
        <div className="searchable-dropdown">
          <input
            type="text"
            className="custom-input dropdown-select"
            placeholder={value || placeholder || "Selecione..."}
            value={isOpen ? searchTerm : value}
            onFocus={() => { setIsOpen(true); setSearchTerm(""); }}
            onChange={(e) => setSearchTerm(e.target.value)}
            readOnly={!isOpen} // Só permite digitar quando focado
          />
          
          {isOpen && (
            <ul className="dropdown-options-list">
              <li className="option-item reset-option" onClick={() => { onChange(""); setIsOpen(false); }}>
                -- Limpar Seleção --
              </li>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, i) => (
                  <li 
                    key={i} 
                    className={`option-item ${value === option ? 'selected' : ''}`}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {option}
                  </li>
                ))
              ) : (
                <li className="option-no-results">Nenhum resultado</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownList;