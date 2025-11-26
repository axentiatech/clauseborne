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
import { Input } from "../ui/input";
import { useState } from "react";
import { NewViolation } from "./new-violation";

const FdcpaList = () => {
  const [search, setSearch] = useState<string>("");
  const { data: lawsuits = [], isLoading } = useQuery(
    trpc.fdcpa.list.queryOptions()
  );

  const filteredLawsuits = lawsuits.filter((lawsuit) => {
    if (!search.trim()) return true;

    const searchLower = search.toLowerCase();
    const documentName = (
      lawsuit.document_name || "Untitled Document"
    ).toLowerCase();

    return documentName.includes(searchLower);
  });

  const getStatus = (lawsuit: (typeof lawsuits)[0]) => {
    if (lawsuit.letter) {
      return {
        label: "Draft Ready",
        icon: CheckCircle2,
        color: "text-primary",
        bgColor: "bg-primary/10",
      };
    }
    if (lawsuit.violations) {
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
          <h2 className="text-xl font-semibold">Your FDCPA Violations</h2>
          <p className="text-sm text-muted-foreground">
            {filteredLawsuits.length === 0
              ? lawsuits.length === 0
                ? "No FDCPA violations detected yet. Upload a document to start your first review."
                : "No FDCPA violations matching your search."
              : `You have ${filteredLawsuits.length} FDCPA violation${
                  filteredLawsuits.length === 1 ? "" : "s"
                }${
                  search.trim() ? " matching your search" : ""
                } in your account.`}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search FDCPA violations"
            className="flex-1 sm:flex-initial sm:w-64"
          />
          <NewViolation className="shrink-0">
            <Plus className="size-4 mr-2" />
            New Violation Review
          </NewViolation>
        </div>
      </div>

      {filteredLawsuits.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-3">
            <div className="p-4 rounded-full bg-muted mb-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {lawsuits.length === 0
                ? "No FDCPA Violations Found"
                : "No Violations Matching Your Search"}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              {lawsuits.length === 0
                ? "Upload your court summons or collection letter to start your first FDCPA violation review. We'll scan your document for potential violations and guide you through your options."
                : "Try adjusting your search terms to find a specific violation case."}
            </p>
            {lawsuits.length === 0 && (
              <NewViolation>
                <Plus className="size-4" />
                Start FDCPA Violation Review
              </NewViolation>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawsuits.map((lawsuit) => {
            const status = getStatus(lawsuit);
            const StatusIcon = status.icon;

            return (
              <Link
                key={lawsuit.id}
                href={`/dashboard/fdcpa-violation/${lawsuit.id}`}
                className="block h-full"
              >
                <Card className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group overflow-hidden gap-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                        <FileText className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <CardTitle className="text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
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
                      <span className="font-medium text-xs">
                        Review Details
                      </span>
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

export default FdcpaList;
