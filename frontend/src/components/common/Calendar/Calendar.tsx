import { DayPicker } from "react-day-picker";
import { useState } from "react";
import "react-day-picker/style.css";

export function Calendar() {
  const [selected, setSelected] = useState<Date>();

  return (
    <DayPicker
      animate
      mode="single"
      selected={selected}
      onSelect={setSelected}
      footer={
        selected ? `Selected: ${selected.toLocaleDateString()}` : "Pick a day."
      }
    />
  );
}