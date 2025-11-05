"use client";

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/kibo-ui/dropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serializeFile } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { UploadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { Streamdown } from "streamdown";

const FileUpload = () => {
  const [files, setFiles] = useState<File[] | undefined>();
  const [ocrResult, setOcrResult] = useState("");
  const {
    mutateAsync: analyse,
    isPending: isAnalysing,
    data: analysisResult,
  } = useMutation(trpc.project.analyse.mutationOptions());

  const {
    mutateAsync: generateCoverLetter,
    isPending: isGenerating,
    data: coverLetter,
  } = useMutation(trpc.project.generateCoverLetter.mutationOptions());

  const { mutateAsync, isPending } = useMutation(
    trpc.project.create.mutationOptions({
      onSuccess: ({ context }) => {
        setOcrResult(context);
        toast.success("File uploaded successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleSubmit = async () => {
    if (!files?.length && !files) {
      toast.warning("Please select a file");
      return;
    }

    const serializedFile = await serializeFile(files[0]);

    await mutateAsync(serializedFile);
  };

  const handleAnalyse = async () => {
    if (!ocrResult) {
      toast.warning("Please upload a file first");
      return;
    }
    await analyse({ context: ocrResult });
    toast.success("Analysis completed successfully");
  };

  const handleGenerateCoverLetter = async () => {
    if (!analysisResult) {
      toast.warning("Please analyse the document first");
      return;
    }

    await generateCoverLetter({
      analyzeInputSchema: { context: ocrResult },
      analyzeSchema: analysisResult,
    });
    toast.success("Cover letter generated successfully");
  };

  return (
    <div className="w-full space-y-4">
      {!ocrResult && (
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
            onDrop={(files) => setFiles(files)}
            onError={console.error}
            src={files}
            disabled={isPending}
            className="border border-dashed max-w-lg justify-center mx-auto"
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>

          {files?.length && files.length > 0 && (
            <Button
              variant={"default"}
              size={"icon-lg"}
              disabled={isPending}
              className="w-full mx-auto"
              onClick={handleSubmit}
            >
              {isPending ? (
                <>
                  <Spinner />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon />
                  Upload Files
                </>
              )}
              <UploadIcon size={16} />
            </Button>
          )}
        </div>
      )}
      {ocrResult && (
        <>
          <div className="border px-3 py-4 bg-card h-96 overflow-auto">
            {<Streamdown>{ocrResult}</Streamdown>}
          </div>
          {
            <Button
              className="w-fit ml-auto"
              onClick={handleAnalyse}
              disabled={isAnalysing}
            >
              {isAnalysing ? (
                <>
                  <Spinner />
                  Analysing...
                </>
              ) : (
                "Analyse"
              )}
            </Button>
          }
        </>
      )}
      {analysisResult && analysisResult.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {analysisResult.map((violation, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Violation {index + 1}</CardTitle>
                  <CardDescription>{violation.violationType}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Violated Section</div>
                    <div className="text-sm text-muted-foreground">
                      {violation.violatedSection}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Violated Quote</div>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md border">
                      &quot;{violation.violatedQuote}&quot;
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Confidence Score</div>
                    <div className="text-sm text-muted-foreground">
                      {violation.confidenceScore}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Explanation</div>
                    <div className="text-sm text-muted-foreground">
                      {violation.explaination}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            onClick={handleGenerateCoverLetter}
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? <Spinner /> : "Generate Cover Letter"}
          </Button>
        </div>
      )}

      {coverLetter && <Streamdown>{coverLetter}</Streamdown>}
    </div>
  );
};

export default FileUpload;
