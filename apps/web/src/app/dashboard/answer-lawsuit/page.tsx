import AnswerLawsuit from "@/components/answer-lawsuit";

const page = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-2 mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Answer a Debt Collection Lawsuit
        </h1>
        <p className="text-sm  text-muted-foreground max-w-2xl">
          Upload your court summons or complaint, review the allegations, answer
          a short questionnaire, and we&apos;ll prepare a draft Answer you can
          file with the court.
        </p>
      </div>
      <AnswerLawsuit />
    </div>
  );
};

export default page;
