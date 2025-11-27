"use client";

import React, { useState, useRef, useEffect } from "react";
import { Streamdown } from "streamdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSignature } from "lucide-react";
import { SummaryEditor, type SummaryEditorRef } from "./editor";
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";

import * as ReactPDF from "@react-pdf/renderer";
import { useCreateBlockNote } from "@blocknote/react";
import { LegalTermNames } from "@/lib/constants";
type GeneratedDraftProps = {
  draft: string;
  onSave?: (markdown: string) => Promise<void> | void;
  isSaving?: boolean;
};

const GeneratedDraft = ({
  draft,
  onSave,
  isSaving = false,
}: GeneratedDraftProps) => {
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [currentDraft, setCurrentDraft] = useState(draft);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const editorRef = useRef<SummaryEditorRef>(null);
  const editor = useCreateBlockNote();

  useEffect(() => {
    if (editor) {
      (async () => {
        if (!currentDraft) return;
        try {
          const blocks = await editor.tryParseMarkdownToBlocks(currentDraft);
          if (blocks && blocks.length) {
            editor.replaceBlocks(editor.document, blocks);
          }
        } catch {
          console.error("Error parsing markdown to blocks");
        }
      })();
    }
  }, [editor, currentDraft]);

  const handleSave = async (markdown: string) => {
    if (onSave) {
      await onSave(markdown);
    }
    setCurrentDraft(markdown);
    setIsEditingDraft(false);
  };

  const handleSaveClick = async () => {
    if (editorRef.current) {
      await editorRef.current.save();
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      if (editor) {
        const blocks = await editor.tryParseMarkdownToBlocks(currentDraft);
        if (!blocks || blocks.length === 0) {
          return;
        }

        editor.replaceBlocks(editor.document, blocks);

        const exporter = new PDFExporter(
          editor.schema,
          pdfDefaultSchemaMappings
        );
        const pdfDocument = await exporter.toReactPDFDocument(editor.document);

        const blob = await ReactPDF.pdf(pdfDocument).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const randomIndex = Math.floor(Math.random() * LegalTermNames.length);
        const randomTerm = LegalTermNames[randomIndex] || "answer-draft";
        link.download = `${randomTerm.replace(/\s+/g, "-")}-draft.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    setCurrentDraft(draft);
  }, [draft]);

  return (
    <div className="w-full space-y-4 px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
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
        <div className="flex items-center justify-end gap-2">
          {!isEditingDraft && (
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              size="sm"
            >
              {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
            </Button>
          )}
          {isEditingDraft ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDraft(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveClick}
                disabled={isSaving || editorRef.current?.isSaving}
              >
                {isSaving || editorRef.current?.isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingDraft(true)}
              disabled={isSaving}
            >
              Edit draft
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-card p-6">
        {isEditingDraft ? (
          <SummaryEditor
            ref={editorRef}
            initialMarkdown={currentDraft}
            onCancel={() => setIsEditingDraft(false)}
            onSave={handleSave}
            hideButtons={true}
          />
        ) : (
          <div className="text-foreground text-sm leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mb-3 [&_h1]:mt-6 [&_h1:first-child]:mt-0 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic">
            <Streamdown>{currentDraft}</Streamdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedDraft;
