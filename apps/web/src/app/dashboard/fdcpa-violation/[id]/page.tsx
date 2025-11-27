import { FdcpaReview } from "@/components/fdcpa/fdcpa-review";
import { NavigateBack } from "@/components/navigate-back";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@iam-pro-say/db";
import { fdcpaViolations } from "@iam-pro-say/db/schema/fdcpa";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [fdcpaViolation] = await db
    .select()
    .from(fdcpaViolations)
    .where(eq(fdcpaViolations.id, id));

  if (!fdcpaViolation) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 space-y-2">
      <div className="flex gap-2 items-center">
        <NavigateBack />
        <h1 className="text-lg font-bold">{fdcpaViolation?.document_name}</h1>
      </div>
      <div className="grid grid-cols-2 h-[80vh] gap-x-2 overflow-hidden">
        <Card className="h-full">
          <iframe
            src={fdcpaViolation.document_url}
            className="w-full h-full"
            frameBorder="0"
          />
        </Card>
        <Card className="h-full overflow-auto">
          <CardHeader>
            <CardTitle>Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <FdcpaReview
              violations={fdcpaViolation.violations ?? []}
              letter={fdcpaViolation.letter ?? ""}
              context={fdcpaViolation.document_content ?? ""}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
