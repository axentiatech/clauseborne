"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewLawsuitDialog } from "@/components/lawsuit/new-lawsuit-dialog";

interface NewLawsuitButtonProps {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  className?: string;
  children?: React.ReactNode;
}

export function NewLawsuitButton({
  variant = "default",
  size = "lg",
  className,
  children,
}: NewLawsuitButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size={size}
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children || (
          <>
            <Plus className="size-4" />
            New Lawsuit
          </>
        )}
      </Button>
      <NewLawsuitDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
