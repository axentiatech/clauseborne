import FdcpaList from "@/components/fdcpa/fdcpa-list";
import Loader from "@/components/loader";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

const page = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">
                FDCPA Violation Detection
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Submit your court summons or complaint, review the listed
                allegations, complete a brief questionnaire, and receive a draft
                Answer ready for you to file in court.
              </p>
            </div>
          </div>
          <Separator />
        </div>
        <Suspense fallback={<Loader />}>
          <FdcpaList />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
