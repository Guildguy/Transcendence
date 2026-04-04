import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../Button/Button';
import './TimeSlot.css';

interface TimeSlotProps {
  timeRange: string;
  onDelete: () => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ timeRange, onDelete }) => {
  return (
    <div className="time-slot">
      <span>{timeRange}</span>
      <X size={18} onClick={onDelete} color="red" cursor="pointer" />
    </div>
  );
};

export default TimeSlot;

// --- Componentes Adicionais ---

interface DayColumnProps {
  day: string;
  slots: { id: number; timeRange: string }[];
  onDelete: (id: number) => void;
  onAddTimeSlot: (day: string, startTime: string, endTime: string) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({ day, slots, onDelete, onAddTimeSlot }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="day-column">
      <h4>{day}</h4>
      <div className="time-slots">
        {slots.map(slot => (
          <TimeSlot
            key={slot.id}
            timeRange={slot.timeRange}
            onDelete={() => onDelete(slot.id)}
          />
        ))}
      </div>
      <Button 
        className="add-time-slot" 
        onClick={() => setShowModal(true)}
      >
        + Horário
      </Button>
      {showModal && (
        <AddTimeSlotModal
          day={day}
          onClose={() => setShowModal(false)}
          onConfirm={(startTime, endTime) => {
            onAddTimeSlot(day, startTime, endTime);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

interface AvailabilityGridProps {
  availabilityData: {
    [key: string]: { id: number; timeRange: string }[];
  };
  handleDelete: (id: number) => void;
  handleAddTimeSlot: (day: string, startTime: string, endTime: string) => void;
}

// --- Modal para Adicionar Novo Horário ---

interface AddTimeSlotModalProps {
  day: string;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
}

const AddTimeSlotModal: React.FC<AddTimeSlotModalProps> = ({ day, onClose, onConfirm }) => {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');

  const handleConfirm = () => {
    if (startTime < endTime) {
      onConfirm(startTime, endTime);
    } else {
      alert('A hora de início deve ser anterior à hora de fim');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Adicionar Horário - {day}</h3>
          <X size={24} onClick={onClose} cursor="pointer" />
        </div>
        <div className="modal-body">
          <div className="time-input-group">
            <label htmlFor="start-time">Hora de Início</label>
            <input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="time-input-group">
            <label htmlFor="end-time">Hora de Fim</label>
            <input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="time-preview">
            <span>{startTime} - {endTime}</span>
          </div>
        </div>
        <div className="modal-footer">
          <Button className="cancel-btn" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="confirm-btn" onClick={handleConfirm}>
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ availabilityData, handleDelete, handleAddTimeSlot }) => {
  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const totalSlots = Object.values(availabilityData).reduce((acc, slots) => acc + slots.length, 0);

  return (
    <>
      <div className="availability-grid">
        {daysOfWeek.map(day => (
          <DayColumn
            key={day}
            day={day}
            slots={availabilityData[day as keyof typeof availabilityData] || []}
            onDelete={handleDelete}
            onAddTimeSlot={handleAddTimeSlot}
          />
        ))}
      </div>
      <div className="availability-footer">
        <span>{totalSlots} Bloco(s) definido(s)</span>
      </div>
    </>
  );
};
