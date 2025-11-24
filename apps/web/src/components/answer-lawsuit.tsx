"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { serializeFile } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import {
  UploadIcon,
  FileText,
  ListChecks,
  ClipboardList,
  FileSignature,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { Streamdown } from "streamdown";
import type {
  Step,
  Allegation,
  Questionnaire,
  OweDebt,
  ProperlyServed,
} from "@/lib/types";
import { INITIAL_QUESTIONNAIRE, US_STATES } from "@/lib/types";

const AnswerLawsuit = () => {
  const [step, setStep] = useState<Step>(1);
  const [files, setFiles] = useState<File[] | undefined>();
  const [context, setContext] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [allegations, setAllegations] = useState<Allegation[]>([]);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>(
    INITIAL_QUESTIONNAIRE
  );
  const [draft, setDraft] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { mutateAsync: uploadDocument, isPending: isUploading } = useMutation(
    trpc.answerLawsuit.create.mutationOptions({
      onSuccess: ({ context, id, url }) => {
        setContext(context);
        setPdfUrl(url);
        setStep(2);
        router.replace(`/dashboard/answer-lawsuit?id=${id}`);
        toast.success("Document uploaded successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const { mutateAsync: runExtractAllegations, isPending: isExtracting } =
    useMutation(
      trpc.answerLawsuit.extractAllegations.mutationOptions({
        onSuccess: (data) => {
          setAllegations(data as Allegation[]);
          toast.success("Allegations extracted from document");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      })
    );

  const { mutateAsync: runGenerateDraft, isPending: isGeneratingDraft } =
    useMutation(
      trpc.answerLawsuit.generateDraft.mutationOptions({
        onSuccess: (data) => {
          setDraft(data as string);
          toast.success("Answer draft generated");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      })
    );

  const handleUpload = async () => {
    if (!files?.length) {
      toast.warning("Please select a file");
      return;
    }

    const serializedFile = await serializeFile(files[0]);
    setAllegations([]);
    setContext("");
    setPdfUrl("");
    await uploadDocument(serializedFile);
  };

  const handleExtractAllegations = async () => {
    if (!context) {
      toast.warning("Upload a document first");
      return;
    }

    await runExtractAllegations({ id: id as string, context });
  };

  const handleNextFromAllegations = () => {
    if (!allegations.length) {
      toast.warning("Please extract allegations first");
      return;
    }
    setStep(3);
  };

  const handleNextFromQuestionnaire = async () => {
    if (
      !questionnaire.state ||
      !questionnaire.county ||
      !questionnaire.caseNumber ||
      !questionnaire.courtName ||
      !questionnaire.oweDebt
    ) {
      console.log(questionnaire);
      toast.warning("Please fill in the required fields before continuing");
      return;
    }

    if (!id) {
      toast.warning("Missing document id. Please upload your document again.");
      return;
    }

    setStep(4);
    setDraft("");

    try {
      await runGenerateDraft({
        id,
        allegations,
        questionnaire,
      });
    } catch (error) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  const updateQuestionnaireField = <K extends keyof Questionnaire>(
    key: K,
    value: Questionnaire[K]
  ) => {
    setQuestionnaire((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFDCPACheck = (
    key: keyof Questionnaire["fdcpaViolations"],
    value: boolean
  ) => {
    setQuestionnaire((prev) => ({
      ...prev,
      fdcpaViolations: {
        ...prev.fdcpaViolations,
        [key]: value,
      },
    }));
  };

  const fdcpaList: {
    key: keyof Questionnaire["fdcpaViolations"];
    label: string;
  }[] = [
    { key: "illegalThreats", label: "Threats of illegal action" },
    { key: "falseStatements", label: "False statements about debt amount" },
    { key: "harassment", label: "Harassment or abuse" },
    { key: "earlyCalls", label: "Calls before 8am or after 9pm" },
    { key: "employerContact", label: "Contacting your employer" },
    {
      key: "ceaseDesistIgnored",
      label: "Continued contact after cease & desist",
    },
    {
      key: "thirdPartyDisclosure",
      label: "Disclosed debt to third parties",
    },
    {
      key: "miniMirandaMissing",
      label: "Missing Mini-Miranda warning in calls/letters",
    },
  ];

  const canGoNextFromUpload = !!context && !isUploading;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
        {[
          { id: 1, label: "Upload", icon: FileText },
          { id: 2, label: "Allegations", icon: ListChecks },
          { id: 3, label: "Questions", icon: ClipboardList },
          { id: 4, label: "Answer Draft", icon: FileSignature },
        ].map(({ id, label, icon: Icon }) => {
          const active = step === id;
          const completed = step > id;
          return (
            <div key={id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-medium ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : completed
                    ? "bg-primary/10 text-primary border-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  Step {id}
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              {id !== 4 && (
                <div
                  className="ml-2 h-px flex-1 bg-border/70"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload your court papers</CardTitle>
            <CardDescription>
              Upload the summons or complaint you received from the court. PDF
              works best.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dropzone
              accept={{
                "application/pdf": [],
              }}
              maxFiles={1}
              maxSize={1024 * 1024 * 10}
              minSize={1024}
              onDrop={(files) => setFiles(files)}
              onError={console.error}
              src={files}
              disabled={isUploading}
              className="border border-dashed max-w-xl justify-center mx-auto"
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>

            {files?.length ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground truncate max-w-xs">
                  Selected file: {files[0].name}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFiles(undefined);
                      setContext("");
                      setPdfUrl("");
                      setAllegations([]);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    size="sm"
                  >
                    {isUploading ? (
                      <>
                        <Spinner />
                        Processing...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Upload &amp; read PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2 border-t mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={!canGoNextFromUpload}
                onClick={() => setStep(2)}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Review the complaint text and allegations</CardTitle>
            <CardDescription>
              We read your document and can pull out each numbered allegation
              for you to review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase text-muted-foreground">
                    Document
                  </Label>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Open in new tab
                    </a>
                  )}
                </div>
                <div className="border rounded-md bg-card h-[500px] overflow-hidden">
                  {pdfUrl ? (
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full"
                      title="PDF Document"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full p-3 text-sm text-muted-foreground">
                      Upload a document in Step 1 to see it here.
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground">
                  Allegations
                </Label>
                <div className="border rounded-md bg-muted/40 h-64 overflow-auto p-3 space-y-2">
                  {allegations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No allegations extracted yet. Click &quot;Extract
                      allegations&quot; to let the AI pull them out of the
                      complaint.
                    </p>
                  ) : (
                    allegations.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-md border bg-background px-3 py-2 text-sm space-y-1"
                      >
                        <p className="font-medium">Allegation {item.id}</p>
                        <p className="text-muted-foreground">{item.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExtractAllegations}
                  disabled={isExtracting || !context}
                >
                  {isExtracting ? (
                    <>
                      <Spinner />
                      Extracting...
                    </>
                  ) : (
                    "Extract allegations"
                  )}
                </Button>
                <Button size="sm" onClick={handleNextFromAllegations}>
                  Continue to questions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your case</CardTitle>
            <CardDescription>
              We&apos;ll use this information to customize your Answer and
              include the right defenses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold tracking-tight">
                Court &amp; case information
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={questionnaire.state}
                    onValueChange={(value) =>
                      updateQuestionnaireField("state", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County *</Label>
                  <Input
                    id="county"
                    value={questionnaire.county}
                    onChange={(e) =>
                      updateQuestionnaireField("county", e.target.value)
                    }
                    placeholder="e.g. Kings County"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courtName">Court name *</Label>
                  <Input
                    id="courtName"
                    value={questionnaire.courtName}
                    onChange={(e) =>
                      updateQuestionnaireField("courtName", e.target.value)
                    }
                    placeholder="e.g. Superior Court of California"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseNumber">Case number *</Label>
                  <Input
                    id="caseNumber"
                    value={questionnaire.caseNumber}
                    onChange={(e) =>
                      updateQuestionnaireField("caseNumber", e.target.value)
                    }
                    placeholder="Case number from your papers"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <h2 className="text-sm font-semibold tracking-tight">
                Debt information
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="debtAmount">Debt amount claimed</Label>
                  <Input
                    id="debtAmount"
                    type="number"
                    value={questionnaire.debtAmount}
                    onChange={(e) =>
                      updateQuestionnaireField("debtAmount", e.target.value)
                    }
                    placeholder="e.g. 5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Do you owe this debt? *</Label>
                  <Select
                    value={questionnaire.oweDebt}
                    onValueChange={(value) =>
                      updateQuestionnaireField("oweDebt", value as OweDebt)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="partially">Partially</SelectItem>
                      <SelectItem value="unsure">Unsure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastPaymentDate">Last payment date</Label>
                  <Input
                    id="lastPaymentDate"
                    type="date"
                    value={questionnaire.lastPaymentDate}
                    onChange={(e) =>
                      updateQuestionnaireField(
                        "lastPaymentDate",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <h2 className="text-sm font-semibold tracking-tight">
                Service of the lawsuit
              </h2>
              <div className="space-y-2 max-w-sm">
                <Label>Were you properly served? *</Label>
                <Select
                  value={questionnaire.properlyServed}
                  onValueChange={(value) =>
                    updateQuestionnaireField(
                      "properlyServed",
                      value as ProperlyServed
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unsure">Unsure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <h2 className="text-sm font-semibold tracking-tight">
                Collection violations (FDCPA)
              </h2>
              <p className="text-xs text-muted-foreground">
                Check anything that happened while the collector was trying to
                collect this debt. This helps us add the right defenses.
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {fdcpaList.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-2 rounded-md border bg-background px-3 py-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={questionnaire.fdcpaViolations[item.key]}
                      onCheckedChange={(checked) =>
                        updateFDCPACheck(item.key, !!checked)
                      }
                      className="mt-0.5"
                    />
                    <span className="text-sm text-foreground">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={isGeneratingDraft}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleNextFromQuestionnaire}
                disabled={isGeneratingDraft}
              >
                {isGeneratingDraft ? (
                  <>
                    <Spinner />
                    Generating...
                  </>
                ) : (
                  <>
                    Continue to Answer draft
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Answer draft</CardTitle>
            <CardDescription>
              This is your AI-generated draft Answer based on the complaint and
              your responses. Review it carefully before filing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground space-y-2">
              {isGeneratingDraft ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span>Generating your Answer draft...</span>
                </div>
              ) : draft ? (
                <Streamdown>{draft}</Streamdown>
              ) : (
                <p>No draft available yet. Go back and generate the draft.</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={isGeneratingDraft}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex flex-wrap gap-2"></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnswerLawsuit;
