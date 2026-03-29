import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ style, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    style={{
      position: "fixed",
      top: 0,
      zIndex: 100,
      display: "flex",
      flexDirection: "column-reverse",
      maxHeight: "100vh",
      width: "100%",
      padding: "1rem",
      right: "0",
      bottom: "0",
      maxWidth: "420px",
    }}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
>(({ style, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.5rem",
        borderRadius: "0.375rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ style, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    style={{
      display: "inline-flex",
      height: "2rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "0.375rem",
      border: "1px solid transparent",
      padding: "0 0.75rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      backgroundColor: "transparent",
      cursor: "pointer",
    }}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ style, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    style={{
      position: "absolute",
      top: "0.5rem",
      right: "0.5rem",
      background: "none",
      border: "none",
      cursor: "pointer",
    }}
    {...props}
  >
    <X style={{ width: "1rem", height: "1rem" }} />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ style, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    style={{ fontSize: "1rem", fontWeight: "bold" }}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ style, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    style={{ fontSize: "0.875rem", opacity: 0.9 }}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
