import { Eye, EyeOff } from "lucide-react";
import React from "react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({ ...props }, ref) => {
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  const toggleVisibility = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setPasswordVisible((prev) => !prev);
  };

  return (
    <InputGroup>
      <InputGroupInput type={passwordVisible ? "text" : "password"} ref={ref} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={toggleVisibility}
          aria-label={passwordVisible ? "Hide password" : "Show password"}
        >
          {passwordVisible ? (
            <EyeOff className="text-muted-foreground size-4" />
          ) : (
            <Eye className="text-muted-foreground size-4" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
});

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
