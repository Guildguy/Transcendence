import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => {
  const styles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: "#f3f4f6",
      color: "#111827",
      borderRadius: "0.375rem",
      padding: "0.25rem 0.5rem",
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    secondary: {
      backgroundColor: "#e5e7eb",
      color: "#374151",
      borderRadius: "0.375rem",
      padding: "0.25rem 0.5rem",
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    destructive: {
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
      borderRadius: "0.375rem",
      padding: "0.25rem 0.5rem",
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    outline: {
      backgroundColor: "transparent",
      color: "#111827",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.25rem 0.5rem",
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
  };

  return (
    <div
      ref={ref}
      style={styles[variant]}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
