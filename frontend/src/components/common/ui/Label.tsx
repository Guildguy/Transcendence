import * as React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ htmlFor, style, ...props }, ref) => (
  <label
    ref={ref}
    htmlFor={htmlFor}
    style={{
      display: "inline-block",
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.5,
      color: "#374151",
      cursor: "pointer",
      ...style,
    }}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };