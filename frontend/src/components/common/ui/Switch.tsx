import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    style={{
      display: "inline-flex",
      height: "1.5rem",
      width: "2.75rem",
      flexShrink: 0,
      cursor: "pointer",
      alignItems: "center",
      borderRadius: "9999px",
      border: "2px solid transparent",
      transition: "background-color 0.2s",
      backgroundColor: props.checked ? "#3b82f6" : "#e5e7eb",
      outline: "none",
    }}
    {...props}
  >
    <SwitchPrimitives.Thumb
      style={{
        pointerEvents: "none",
        display: "block",
        height: "1.25rem",
        width: "1.25rem",
        borderRadius: "9999px",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
        transform: props.checked ? "translateX(1.25rem)" : "translateX(0)",
        transition: "transform 0.2s",
      }}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
