"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { type Violation } from "@iam-pro-say/db/schema/fdcpa";
import { IconFeather } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "../ui/item";
import { Badge } from "@/components/ui/badge";
import { Separator } from "../ui/separator";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useParams, useRouter } from "next/navigation";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { SummaryEditor, type SummaryEditorRef } from "../lawsuit/editor";
import { useState, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import * as ReactPDF from "@react-pdf/renderer";
import { useCreateBlockNote } from "@blocknote/react";
import { Download } from "lucide-react";

interface FdcpaReviewProps {
  violations: Violation[];
  letter?: string;
  context?: string;
}
export function FdcpaReview({ violations, letter, context }: FdcpaReviewProps) {
  const router = useRouter();
  const { mutateAsync, isPending } = useMutation(
    trpc.fdcpa.generateLetter.mutationOptions({
      onSuccess: () => {
        toast.success("Cover letter generated successfully");
        router.refresh();
      },
    })
  );
  const params = useParams<{ id: string }>();

  return (
    <div className="h-full overflow-y-scroll">
      {violations.length === 0 && <EmptyState />}

      {violations.length >= 1 && (
        <div className="space-y-2">
          {violations.map((violation) => (
            <ViolationItem key={violation.fdcpaSection} violation={violation} />
          ))}

          {!letter && (
            <Button
              className="w-full"
              onClick={() =>
                mutateAsync({
                  context: context ?? "",
                  id: params.id,
                  violations,
                })
              }
              disabled={isPending}
            >
              {isPending
                ? "Generating Cover Letter ..."
                : "Generate Cover Letter"}
            </Button>
          )}

          {letter && <ViewLetter letter={letter} />}
        </div>
      )}
    </div>
  );
}

function ViolationItem({ violation }: { violation: Violation }) {
  return (
    <Item variant={"outline"}>
      <ItemContent>
        <ItemTitle className="line-clamp-1">{violation.quote}</ItemTitle>
        <ItemDescription className="line-clamp-1">
          {violation.explanation}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <ViolationViewMore violation={violation} />
      </ItemActions>
    </Item>
  );
}

function EmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFeather />
        </EmptyMedia>
        <EmptyTitle>No Violation Detected</EmptyTitle>
        <EmptyDescription>
          There were no violation detected in the document. You can create a
          manual violation.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button disabled>Create Manually</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

function ViewLetter({ letter }: { letter: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<SummaryEditorRef>(null);
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pdfEditor = useCreateBlockNote();

  const { mutateAsync: saveLetter, isPending: isSaving } = useMutation(
    trpc.fdcpa.saveLetter.mutationOptions({
      onSuccess: () => {
        toast.success("Letter saved successfully");
        setIsEditing(false);
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleDownloadPDF = async () => {
    if (!pdfEditor) return;

    try {
      const blocks = await pdfEditor.tryParseMarkdownToBlocks(letter);
      if (!blocks || blocks.length === 0) {
        toast.error("Unable to parse letter content");
        return;
      }

      pdfEditor.replaceBlocks(pdfEditor.document, blocks);

      const exporter = new PDFExporter(
        pdfEditor.schema,
        pdfDefaultSchemaMappings
      );
      const pdfDocument = await exporter.toReactPDFDocument(pdfEditor.document);

      const blob = await ReactPDF.pdf(pdfDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fdcpa-violation-letter-${params.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error("PDF generation error:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">View Letter</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl overflow-auto h-[55vh]">
        <DialogHeader>
          <DialogTitle>Cover Letter</DialogTitle>
          <DialogDescription>
            The cover letter for the FDCPA violations generated by AI. Please
            review it carefully
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          {isEditing ? (
            <>
              <Button
                onClick={async () => {
                  if (editorRef.current) {
                    await editorRef.current.save();
                  }
                }}
                disabled={isSaving || editorRef.current?.isSaving}
              >
                {isSaving || editorRef.current?.isSaving ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving || editorRef.current?.isSaving}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)}>Edit Letter</Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </>
          )}
        </DialogFooter>
        <Separator />
        <div className="space-y-2">
          {isEditing ? (
            <SummaryEditor
              ref={editorRef}
              initialMarkdown={letter}
              onCancel={() => setIsEditing(false)}
              onSave={async (markdown) => {
                await saveLetter({
                  id: params.id,
                  letter: markdown,
                });
              }}
            />
          ) : (
            <Streamdown>{letter}</Streamdown>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ViolationViewMore({ violation }: { violation: Violation }) {
  const getConfidenceBadge = (confidence: Violation["confidence"]) => {
    switch (confidence) {
      case "High":
        return <Badge>High</Badge>;
      case "Medium":
        return <Badge>Medium</Badge>;
      case "Low":
        return <Badge>Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"}>View More</Button>
      </DialogTrigger>
      <DialogContent className="pt-8">
        <DialogTitle>{violation.quote}</DialogTitle>
        <DialogDescription>{violation.explanation}</DialogDescription>
        <h3 className="text-sm">Section: {violation.fdcpaSection}</h3>
        <Separator />
        <DialogFooter className="items-center">
          <span className="text-xs">Confidence:</span>{" "}
          {getConfidenceBadge(violation.confidence)}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
