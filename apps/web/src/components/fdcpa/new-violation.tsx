import type React from "react";
import { type VariantProps } from "class-variance-authority";
import { Button, type buttonVariants } from "../ui/button";
import { useState } from "react";
import { FdcpaDialog } from "./fdcpa-dialog";

type NewViolationProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function NewViolation({
  variant = "default",
  size = "lg",
  children,
}: NewViolationProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <FdcpaDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
