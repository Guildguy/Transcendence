import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    style={{
      display: "flex",
      height: "2.5rem",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: "0.375rem",
      border: "1px solid #d1d5db",
      backgroundColor: "#ffffff",
      padding: "0.5rem 0.75rem",
      fontSize: "0.875rem",
      outline: "none",
    }}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown style={{ height: "1rem", width: "1rem", opacity: 0.5 }} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    style={{
      display: "flex",
      cursor: "default",
      alignItems: "center",
      justifyContent: "center",
      padding: "0.25rem",
    }}
    {...props}
  >
    <ChevronUp style={{ height: "1rem", width: "1rem" }} />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    style={{
      display: "flex",
      cursor: "default",
      alignItems: "center",
      justifyContent: "center",
      padding: "0.25rem",
    }}
    {...props}
  >
    <ChevronDown style={{ height: "1rem", width: "1rem" }} />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      style={{
        position: "relative",
        zIndex: 50,
        maxHeight: "24rem",
        minWidth: "8rem",
        overflow: "hidden",
        borderRadius: "0.375rem",
        border: "1px solid #d1d5db",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        style={{
          padding: "0.25rem",
        }}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    style={{
      padding: "0.375rem 2rem 0.375rem 0.5rem",
      fontSize: "0.875rem",
      fontWeight: 600,
    }}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    style={{
      display: "flex",
      width: "100%",
      cursor: "default",
      alignItems: "center",
      borderRadius: "0.25rem",
      padding: "0.375rem 0.5rem",
      fontSize: "0.875rem",
      outline: "none",
    }}
    {...props}
  >
    <span
      style={{
        position: "absolute",
        left: "0.5rem",
        display: "flex",
        height: "0.875rem",
        width: "0.875rem",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SelectPrimitive.ItemIndicator>
        <Check style={{ height: "1rem", width: "1rem" }} />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    style={{
      margin: "0.25rem 0",
      height: "1px",
      backgroundColor: "#e5e7eb",
    }}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};