"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function NavigateBack() {
  const router = useRouter();
  return (
    <Button size={"icon-sm"} variant={"ghost"} onClick={() => router.back()}>
      <ArrowLeft className="size-4" />
    </Button>
  );
}
