import AnswerLawsuit from "@/components/lawsuit/answer-lawsuit";
import GeneratedDraft from "@/components/lawsuit/generated-draft";
import { db } from "@iam-pro-say/db";
import { answerLawsuit } from "@iam-pro-say/db/schema/answer-lawsuit";
import { eq } from "drizzle-orm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lawsuitData] = await db
    .select()
    .from(answerLawsuit)
    .where(eq(answerLawsuit.id, id));

  if (lawsuitData?.draft_content && lawsuitData.draft_content.length > 0) {
    return <GeneratedDraft draft={lawsuitData.draft_content} />;
  }
  return <AnswerLawsuit initialId={id} />;
}
