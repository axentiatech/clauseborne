"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewLawsuitButton } from "@/components/lawsuit/new-lawsuit-button";
import { Spinner } from "@/components/ui/spinner";

const LawsuitList = () => {
  const { data: lawsuits = [], isLoading } = useQuery(
    trpc.answerLawsuit.list.queryOptions()
  );

  const getStatus = (lawsuit: (typeof lawsuits)[0]) => {
    if (lawsuit.draft_content) {
      return {
        label: "Draft Ready",
        icon: CheckCircle2,
        color: "text-primary",
        bgColor: "bg-primary/10",
      };
    }
    if (lawsuit.allegations) {
      return {
        label: "In Progress",
        icon: Clock,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
      };
    }
    return {
      label: "Uploaded",
      icon: AlertCircle,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Your Lawsuits</h2>
          <p className="text-sm text-muted-foreground">
            {lawsuits.length === 0
              ? "No lawsuits yet. Create your first one to get started."
              : `You have ${lawsuits.length} ${
                  lawsuits.length === 1 ? "lawsuit" : "lawsuits"
                } in your account.`}
          </p>
        </div>
        <NewLawsuitButton className="w-full sm:w-auto" />
      </div>

      {lawsuits.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="p-4 rounded-full bg-muted mb-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No lawsuits yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              Get started by creating your first lawsuit answer. Upload your
              court documents and we&apos;ll help you prepare a professional
              response.
            </p>
            <NewLawsuitButton>
              <Plus className="size-4" />
              Create Your First Lawsuit
            </NewLawsuitButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawsuits.map((lawsuit) => {
            const status = getStatus(lawsuit);
            const StatusIcon = status.icon;

            return (
              <Link
                key={lawsuit.id}
                href={`/dashboard/answer-lawsuit/${lawsuit.id}`}
                className="block h-full"
              >
                <Card className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group overflow-hidden gap-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                        <FileText className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {lawsuit.document_name || "Untitled Document"}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
                              status.bgColor,
                              status.color
                            )}
                          >
                            <StatusIcon className="size-3" />
                            <span>{status.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardFooter className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-primary group-hover:gap-3 transition-all w-full">
                      <span className="font-medium">View Details</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LawsuitList;
