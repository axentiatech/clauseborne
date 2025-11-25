import React from "react";
import { Streamdown } from "streamdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileSignature } from "lucide-react";

const GeneratedDraft = ({ draft }: { draft: string }) => {
  return (
    <div className="w-full space-y-4 px-6 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSignature className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle>Answer Draft</CardTitle>
              <CardDescription>
                Review your AI-generated Answer draft carefully before filing.
                This document is based on the complaint and your responses.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-foreground text-sm leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mb-3 [&_h1]:mt-6 [&_h1:first-child]:mt-0 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic">
              <Streamdown>{draft}</Streamdown>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneratedDraft;
