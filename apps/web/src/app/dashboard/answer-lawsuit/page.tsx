import LawsuitList from "@/components/lawsuit/lawsuit-list";
import Loader from "@/components/loader";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";

const page = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">
                Answer a Debt Collection Lawsuit
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Upload your court summons or complaint, review the allegations,
                answer a short questionnaire, and we&apos;ll prepare a draft
                Answer you can file with the court.
              </p>
            </div>
          </div>
          <Separator />
        </div>
        <Suspense fallback={<Loader />}>
          <LawsuitList />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
