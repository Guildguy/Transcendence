import * as React from "react";

const CalendarCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        borderRadius: "0.5rem",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        color: "#111827",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
      {...props}
    />
  )
);
CalendarCard.displayName = "CalendarCard";

const CalendarCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
        padding: "1.5rem",
      }}
      {...props}
    />
  )
);
CalendarCardHeader.displayName = "CalendarCardHeader";

const CalendarCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      style={{
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      }}
      {...props}
    />
  )
);
CalendarCardTitle.displayName = "CalendarCardTitle";

const CalendarCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      style={{
        fontSize: "0.875rem",
        color: "#6b7280",
      }}
      {...props}
    />
  )
);
CalendarCardDescription.displayName = "CalendarCardDescription";

const CalendarCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        padding: "1.5rem",
        paddingTop: 0,
      }}
      {...props}
    />
  )
);
CalendarCardContent.displayName = "CalendarCardContent";

const CalendarCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "1.5rem",
        paddingTop: 0,
      }}
      {...props}
    />
  )
);
CalendarCardFooter.displayName = "CalendarCardFooter";

export {
  CalendarCard,
  CalendarCardHeader,
  CalendarCardFooter,
  CalendarCardTitle,
  CalendarCardDescription,
  CalendarCardContent,
};
