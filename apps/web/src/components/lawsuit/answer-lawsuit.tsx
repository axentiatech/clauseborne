"use client";

import { useEffect, useState } from "react";
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
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FileText,
  ListChecks,
  ClipboardList,
  FileSignature,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { Streamdown } from "streamdown";
import type {
  Step,
  Allegation,
  Questionnaire,
  OweDebt,
  ProperlyServed,
} from "@/lib/types";
import { fdcpaList, LegalTermNames } from "@/lib/constants";
import { US_STATES, INITIAL_QUESTIONNAIRE } from "@/lib/types";
import { SummaryEditor } from "./editor";
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";

import * as ReactPDF from "@react-pdf/renderer";
import { useCreateBlockNote } from "@blocknote/react";

const AnswerLawsuit = ({ initialId }: { initialId?: string }) => {
  const [step, setStep] = useState<Step>(2);
  const [context, setContext] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [allegations, setAllegations] = useState<Allegation[]>([]);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>(
    INITIAL_QUESTIONNAIRE
  );
  const [draft, setDraft] = useState<string>("");
  const searchParams = useSearchParams();
  const id = initialId ?? searchParams.get("id");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newAllegationText, setNewAllegationText] = useState<string>("");
  const [isEditingDraft, setIsEditingDraft] = useState<boolean>(false);
  const editor = useCreateBlockNote();

  const { data: lawsuitData, isLoading: isLoadingLawsuit } = useQuery(
    trpc.answerLawsuit.get.queryOptions(
      { id: id as string },
      {
        enabled: !!id,
      }
    )
  );

  useEffect(() => {
    if (lawsuitData) {
      if (lawsuitData.document_url) {
        setPdfUrl(lawsuitData.document_url);
      }
      if (lawsuitData.document_content) {
        setContext(lawsuitData.document_content);
      }
      if (lawsuitData.allegations && Array.isArray(lawsuitData.allegations)) {
        setAllegations(lawsuitData.allegations as Allegation[]);
      }
    }
  }, [lawsuitData]);

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
          setDraft(data);
          toast.success("Answer draft generated");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      })
    );

  const { mutateAsync: updateAllegationMut, isPending: isUpdatingAllegation } =
    useMutation(
      trpc.answerLawsuit.updateAllegation.mutationOptions({
        onSuccess: () => {
          toast.success("Allegations updated");
        },
        onError: (err) => {
          toast.error(err.message);
        },
      })
    );

  const handleExtractAllegations = async () => {
    if (!id) {
      toast.warning("Missing document id");
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

  const handleStartCreateAllegation = () => {
    setIsCreatingNew(true);
    setNewAllegationText("");
  };

  const handleCancelCreateAllegation = () => {
    setIsCreatingNew(false);
    setNewAllegationText("");
  };

  const handleSaveNewAllegation = async () => {
    if (!id) {
      toast.error("Missing document id");
      return;
    }
    if (!newAllegationText.trim()) {
      toast.warning("Please enter allegation text");
      return;
    }
    const newId =
      allegations.length > 0
        ? Math.max(...allegations.map((a) => a.id)) + 1
        : 1;
    const newAllegation: Allegation = {
      id: newId,
      text: newAllegationText.trim(),
    };
    const updatedAllegations = [...allegations, newAllegation];
    try {
      await updateAllegationMut({
        id: id as string,
        allegations: updatedAllegations,
      });
      setAllegations(updatedAllegations);
      setIsCreatingNew(false);
      setNewAllegationText("");
      toast.success("Allegation added successfully");
    } catch (e) {}
  };

  const { mutateAsync: saveDraftMut, isPending: isSavingDraft } = useMutation(
    trpc.answerLawsuit.saveDraft.mutationOptions({
      onSuccess: () => {
        toast.success("Draft saved");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleDeleteAllegation = async (allegationId: number) => {
    if (!id) {
      toast.error("Missing document id");
      return;
    }
    const updatedAllegations = allegations.filter(
      (alg) => alg.id !== allegationId
    );
    try {
      await updateAllegationMut({
        id: id as string,
        allegations: updatedAllegations,
      });
      setAllegations(updatedAllegations);
      if (editingId === allegationId) {
        setEditingId(null);
        setEditingText("");
      }
    } catch (e) {}
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
    setStep((prev) => (prev > 2 ? ((prev - 1) as Step) : prev));
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

  const handleDownloadPDF = async () => {
    if (!id) {
      toast.error("Missing document id");
      return;
    }
    if (editor) {
      const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);
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
  };

  return (
    <div className="w-full space-y-4 px-6">
      <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3 ">
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

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Review the complaint text and allegations</CardTitle>
            <CardDescription>
              We read your document and can pull out each numbered allegation
              for you to review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-2">
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
                <div className="border rounded-md bg-card h-[55vh] overflow-hidden p-2">
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
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase text-muted-foreground">
                    Allegations
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartCreateAllegation}
                    disabled={isUpdatingAllegation || !id || isCreatingNew}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add custom
                  </Button>
                </div>
                <div className="border rounded-md bg-muted/40 h-[55vh] overflow-auto p-4 space-y-3">
                  {isCreatingNew && (
                    <div className="rounded-md border bg-background px-3 py-2 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">New Allegation</p>
                      </div>
                      <textarea
                        value={newAllegationText}
                        onChange={(e) => setNewAllegationText(e.target.value)}
                        className="w-full rounded-md border px-2 py-1 text-sm"
                        rows={4}
                        placeholder="Enter allegation text..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveNewAllegation}
                          disabled={
                            isUpdatingAllegation || !newAllegationText.trim()
                          }
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelCreateAllegation}
                          disabled={isUpdatingAllegation}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  {allegations.length === 0 && !isCreatingNew ? (
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
                        <div className="flex items-start justify-between">
                          <p className="font-medium">Allegation {item.id}</p>
                          <div className="flex items-center gap-2">
                            {editingId === item.id ? null : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditingText(item.text);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteAllegation(item.id)
                                  }
                                  disabled={isUpdatingAllegation}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {editingId === item.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full rounded-md border px-2 py-1 text-sm"
                              rows={4}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  if (!id) {
                                    toast.error("Missing document id");
                                    return;
                                  }
                                  try {
                                    const updatedAllegations: Allegation[] =
                                      allegations.map((alg) =>
                                        alg.id === item.id
                                          ? { ...alg, text: editingText }
                                          : alg
                                      );
                                    await updateAllegationMut({
                                      id: id as string,
                                      allegations: updatedAllegations,
                                    });
                                    setAllegations(updatedAllegations);
                                    setEditingId(null);
                                  } catch (e) {
                                    // error handled by mutation onError
                                  }
                                }}
                                disabled={isUpdatingAllegation}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingText("");
                                }}
                                disabled={isUpdatingAllegation}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">{item.text}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleBack} disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExtractAllegations}
                  disabled={isExtracting || isLoadingLawsuit || !id}
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
          <CardHeader className="p-4">
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
        <>
          <div className="flex items-center justify-end gap-4">
            {draft && !isGeneratingDraft && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingDraft((prev) => !prev)}
                  disabled={isSavingDraft}
                >
                  {isEditingDraft ? "Cancel editing" : "Edit draft"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingDraft}
                  className="bg-primary text-white hover:bg-rpimary hp"
                >
                  Download PDF
                </Button>
              </>
            )}
          </div>

          <div className="rounded-md  bg-muted/40 p-6 text-sm text-muted-foreground space-y-2">
            {isGeneratingDraft ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>Generating your Answer draft...</span>
              </div>
            ) : draft ? (
              isEditingDraft ? (
                <SummaryEditor
                  initialMarkdown={draft}
                  onCancel={() => setIsEditingDraft(false)}
                  onSave={async (markdown) => {
                    if (!id) {
                      toast.error("Missing document id");
                      return;
                    }
                    const nextDraft = markdown || "";
                    await saveDraftMut({
                      id: id as string,
                      draft: nextDraft,
                    });
                    setDraft(nextDraft);
                    setIsEditingDraft(false);
                  }}
                />
              ) : (
                <Streamdown className=" ">{draft}</Streamdown>
              )
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
        </>
      )}
    </div>
  );
};

export default AnswerLawsuit;
