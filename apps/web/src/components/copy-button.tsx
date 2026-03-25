import { mergeProps, useRender } from "@base-ui/react";
import { Check, Copy } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends useRender.ComponentProps<"button"> {
  text: string;
}

export default function CopyButton({ text, className, render, children, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const icon = copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />;

  const triggerElement = useRender({
    defaultTagName: "button",
    render: render || <Button variant="outline" size="icon" />,
    props: mergeProps(
      {
        type: "button",
        className: cn("cursor-pointer", className),
        onClick: handleCopy,
        children: children || icon,
      },
      props,
    ),
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={triggerElement} />

        <TooltipContent>{copied ? "Copied!" : "Copy to clipboard"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
