import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

export async function ocr(fileUrl: string) {
  const result = await mistral.ocr.process({
    model: "mistral-ocr-2505",
    document: {
      documentUrl: fileUrl,
      type: "document_url",
    },
  });

  return result;
}
