"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/kibo-ui/dropzone";
import { Button } from "@/components/ui/button";
import { serializeFile } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

interface NewLawsuitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewLawsuitDialog({
  open,
  onOpenChange,
}: NewLawsuitDialogProps) {
  const [files, setFiles] = useState<File[] | undefined>();
  const router = useRouter();

  const { mutateAsync: uploadDocument, isPending: isUploading } = useMutation(
    trpc.answerLawsuit.create.mutationOptions({
      onSuccess: ({ id }) => {
        toast.success("Document uploaded successfully");
        onOpenChange(false);
        setFiles(undefined);
        router.push(`/dashboard/answer-lawsuit/${id}`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to upload document");
      },
    })
  );

  const handleUpload = async () => {
    if (!files?.length) {
      toast.warning("Please select a file");
      return;
    }

    try {
      const serializedFile = await serializeFile(files[0]);
      await uploadDocument(serializedFile);
    } catch (error) {
      toast.error("Failed to process file");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload New Lawsuit Document</DialogTitle>
          <DialogDescription>
            Upload your court summons or complaint document. We&apos;ll help you
            prepare a professional response.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Dropzone
            accept={{
              "application/pdf": [".pdf"],
            }}
            maxFiles={1}
            maxSize={1024 * 1024 * 10} // 10MB
            minSize={1024} // 1KB
            onDrop={(acceptedFiles) => setFiles(acceptedFiles)}
            onError={(error) => {
              toast.error(error.message || "File upload error");
            }}
            src={files}
            disabled={isUploading}
            className="border border-dashed"
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>

          {files?.length && files.length > 0 && (
            <Button
              variant="default"
              size="lg"
              disabled={isUploading}
              className="w-full"
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Spinner />
                  Uploading and processing...
                </>
              ) : (
                <>
                  <UploadIcon className="size-4" />
                  Upload Document
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
