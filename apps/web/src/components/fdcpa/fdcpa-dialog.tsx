import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { serializeFile } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "../kibo-ui/dropzone";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { FileTextIcon, UploadIcon } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

type FdcpaDialogProps = React.ComponentProps<typeof DialogPrimitive.Root> & {
  title?: string;
};

export function FdcpaDialog(props: FdcpaDialogProps) {
  const [files, setFiles] = useState<File[] | undefined>();
  const [step, setStep] = useState<"0" | "1">("0");
  const { mutateAsync, isPending } = useMutation(
    trpc.fdcpa.create.mutationOptions({})
  );

  const { mutateAsync: extractViolations, isPending: isExtracting } =
    useMutation(trpc.fdcpa.extractViolations.mutationOptions({}));

  const handleUpload = async () => {
    if (!files?.length) {
      toast.warning("Please select a file");
      return;
    }

    try {
      const serializedFile = await serializeFile(files[0]);
      const result = await mutateAsync(serializedFile);
      setStep("1");
      await extractViolations({ context: result.context, id: result.id });
      props.onOpenChange?.(false);
    } catch (error) {
      toast.error("Failed to process file");
    }
  };

  return (
    <Dialog {...props} open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        {step === "0" && (
          <UploadStep
            files={files}
            setFiles={setFiles}
            handleUpload={handleUpload}
            isPending={isPending}
          />
        )}

        {step === "1" && (
          <ExtractionStep fileName={files?.[0]?.name || "Untitled"} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function UploadStep({
  files,
  handleUpload,
  isPending,
  setFiles,
}: {
  files: File[] | undefined;
  isPending: boolean;
  setFiles: (files: File[]) => void;
  handleUpload: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Upload the Violation Document</DialogTitle>
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
          disabled={isPending}
          className="border border-dashed"
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>

        {files?.length && files.length > 0 && (
          <Button
            variant="default"
            size="lg"
            disabled={isPending}
            className="w-full"
            onClick={handleUpload}
          >
            {isPending ? (
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
    </>
  );
}

function ExtractionStep({ fileName }: { fileName: string }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Extracting Violations</DialogTitle>
        <DialogDescription>
          We are extracting the violations from the document. This may take a
          few minutes.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <Item variant={"outline"} className="bg-muted">
          <ItemMedia>
            <FileTextIcon className="size-4 text-muted-foreground" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1 text-muted-foreground">
              {fileName}
            </ItemTitle>
          </ItemContent>
          <ItemContent>
            <Spinner />
          </ItemContent>
        </Item>
      </div>
    </>
  );
}
