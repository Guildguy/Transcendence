import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ style, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    style={{
      position: "fixed",
      top: "auto",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      maxHeight: "100vh",
      width: "100%",
      padding: "1rem",
      bottom: "0",
      right: "0",
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
        paddingRight: "2rem",
        borderRadius: "0.375rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s",
      }}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;