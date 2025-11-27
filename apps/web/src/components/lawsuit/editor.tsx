"use client";

import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { en } from "@blocknote/core/locales";
import { BlockNoteView, type Theme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  FormattingToolbar,
  FormattingToolbarController,
  getDefaultReactSlashMenuItems,
  getFormattingToolbarItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import {
  AIMenuController,
  AIToolbarButton,
  createAIExtension,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import "@blocknote/xl-ai/style.css";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";

type SummaryEditorProps = {
  initialMarkdown: string;
  onCancel: () => void;
  onSave: (markdown: string) => Promise<void> | void;
  hideButtons?: boolean;
};

export type SummaryEditorRef = {
  save: () => Promise<void>;
  isSaving: boolean;
};

const myTheme: Theme = {
  colors: {
    editor: {
      text: "#000000",
      background: "#ffffff",
    },
  },
};

export const SummaryEditor = forwardRef<SummaryEditorRef, SummaryEditorProps>(
  ({ initialMarkdown, onCancel, onSave, hideButtons = false }, ref) => {
    const [saving, setSaving] = useState(false);

    const editor = useCreateBlockNote({
      dictionary: { ...en, ai: aiEn },
      extensions: [
        createAIExtension({
          transport: new DefaultChatTransport({ api: "/api/blocknote-chat" }),
        }),
      ],
      initialContent: [
        {
          type: "paragraph",
          content: initialMarkdown || "",
        },
      ],
    });

    useEffect(() => {
      (async () => {
        if (!initialMarkdown) return;
        try {
          const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown);
          if (blocks && blocks.length) {
            editor.replaceBlocks(editor.document, blocks);
          }
        } catch {
          console.error("Error parsing markdown to blocks");
        }
      })();
    }, [editor, initialMarkdown]);

    const handleSave = async () => {
      setSaving(true);
      try {
        const md = await editor.blocksToMarkdownLossy(editor.document);
        await onSave(md);
      } finally {
        setSaving(false);
      }
    };

    useImperativeHandle(ref, () => ({
      save: handleSave,
      isSaving: saving,
    }));

    return (
      <div className="rounded-md border bg-white text-black">
        <BlockNoteView
          editor={editor}
          formattingToolbar={false}
          slashMenu={false}
          className="bg-white text-black"
          tabIndex={1}
          theme={myTheme}
        >
          <AIMenuController />
          <FormattingToolbarController
            formattingToolbar={() => (
              <FormattingToolbar>
                {...getFormattingToolbarItems()}
                <AIToolbarButton />
              </FormattingToolbar>
            )}
          />
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
              filterSuggestionItems(
                [
                  ...getDefaultReactSlashMenuItems(editor),
                  ...getAISlashMenuItems(editor),
                ],
                query
              )
            }
          />
        </BlockNoteView>
      </div>
    );
  }
);

SummaryEditor.displayName = "SummaryEditor";
