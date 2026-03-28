import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { X } from "lucide-react";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Portal>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>
>(({ children, ...props }, ref) => (
  <DialogPrimitive.Portal ref={ref} {...props}>
    {children}
  </DialogPrimitive.Portal>
));
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 50,
      ...style,
    }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ style, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        zIndex: 50,
        display: "grid",
        width: "100%",
        maxWidth: "32rem", // Equivalent to max-w-lg
        transform: "translate(-50%, -50%)",
        gap: "1rem", // Equivalent to gap-4
        border: "1px solid #e5e7eb", // Tailwind border
        backgroundColor: "#ffffff", // Tailwind bg-background
        padding: "1.5rem", // Tailwind p-6
        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)", // Tailwind shadow-lg
        borderRadius: "0.5rem", // Tailwind sm:rounded-lg
        transition: "all 0.2s ease-in-out", // Tailwind duration-200
        ...style,
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        style={{
          position: "absolute",
          right: "1rem", // Tailwind right-4
          top: "1rem", // Tailwind top-4
          borderRadius: "0.25rem", // Tailwind rounded-sm
          opacity: 0.7, // Tailwind opacity-70
          transition: "opacity 0.2s ease-in-out", // Tailwind transition-opacity
        }}
      >
        <X style={{ height: "1rem", width: "1rem" }} />
        <span style={{ position: "absolute", clip: "rect(1px, 1px, 1px, 1px)", width: "1px", height: "1px", overflow: "hidden" }}>Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    style={{
      fontSize: "1.25rem",
      fontWeight: 600,
      marginBottom: "0.5rem",
      ...style,
    }}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    style={{
      fontSize: "1rem",
      color: "#6b7280",
      marginBottom: "1rem",
      ...style,
    }}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "1rem",
        ...style,
      }}
      {...props}
    />
  )
);
DialogFooter.displayName = "DialogFooter";

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem", // Equivalent to space-y-2
        textAlign: "center",
        ...style,
      }}
      {...props}
    />
  )
);
DialogHeader.displayName = "DialogHeader";

const DialogClose = DialogPrimitive.Close;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogHeader,
};