"use client";

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
import { useState } from "react";
import { toast } from "sonner";

const FileUpload = () => {
  const [files, setFiles] = useState<File[] | undefined>();
  const { mutateAsync, isPending } = useMutation(
    trpc.project.create.mutationOptions({
      onSuccess: () => {
        toast.success("File uploaded successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleDrop = (files: File[]) => {
    console.log(files);
    setFiles(files);
  };

  const handleSubmit = async () => {
    if (!files?.length && !files) {
      toast.warning("Please select a file");
      return;
    }

    const serializedFile = await serializeFile(files[0]);

    await mutateAsync(serializedFile);
  };

  return (
    <div className="flex justify-center flex-col gap-2 max-w-md mx-auto">
      <Dropzone
        accept={{
          "application/pdf": [],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            [".docx"],
        }}
        maxFiles={1}
        maxSize={1024 * 1024 * 10}
        minSize={1024}
        onDrop={handleDrop}
        onError={console.error}
        src={files}
        className="border border-dashed max-w-lg justify-center mx-auto"
      >
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>

      {files?.length && files.length > 0 && (
        <Button
          variant={"default"}
          size={"icon-lg"}
          className="w-full mx-auto"
          onClick={handleSubmit}
        >
          Upload Files
          <UploadIcon size={16} />
        </Button>
      )}
    </div>
  );
};

export default FileUpload;
