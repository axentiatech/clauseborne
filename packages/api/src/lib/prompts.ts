import { encode } from "@toon-format/toon";
import type { Questionnaire } from "../schema/answer-lawsuit";
const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0]; // Returns YYYY-MM-DD
};

export function getFdcpaPrompt({ context }: { context: string }) {
  return `
        You are an FDCPA (Fair Debt Collection Practices Act) violation detection system.

        Analyze this debt collection letter and identify any violations of 15 U.S.C. §1692.

        LETTER TEXT:
        ${context}

        Scan for these specific violations:
        1. Threats of illegal action (arrest, jail, wage garnishment without court order)
        2. False statements about debt amount or legal status
        3. Harassment, abuse, or profane language
        4. Contact outside 8am-9pm
        5. Contacting employer
        6. Disclosing debt to third parties
        7. Missing Mini-Miranda warning ("This is an attempt to collect a debt...")
        8. Continuing contact after cease & desist
        9. False representation of being attorney/government
        10. Threatening to report to credit bureaus falsely

        For each violation found, provide:
        - Violation type
        - Specific FDCPA section violated (e.g., §1692d, §1692e, §1692f)
        - Quote from letter showing violation
        - Confidence score (0-100%)
        - Explanation

        Output as JSON array. The date is ${getCurrentDate()}.
    `;
}

export function coverLetterPrompt(violations: any, context: string) {
  return `
        Generate a professional FDCPA violation demand letter.

VIOLATIONS DETECTED:
${JSON.stringify(violations, null, 2)}

Other Context: 
${context}


Generate a demand letter with:
1. Professional business letter format
2. Date and addresses
3. RE: line with case reference
4. Clear statement of each violation with statutory citation
5. Demand for:
   - Immediate cease of collection activities
   - Written validation of debt
   - Statutory damages ($1,000 per violation under §1692k)
   - Actual damages (emotional distress)
6. 15-day response deadline
7. Warning of potential legal action

Tone: Assertive but professional (not threatening)

Output the complete letter ready to send.
    `;
}

export function extractAllegationsPrompt({ context }: { context: string }) {
  return `
        Extract the allegations from the following text.

        TEXT:
        ${context}

      "allegations":[
      {"id":1,"text":"Defendant owes $4,500 on account 12345."},
      {"id":2,"text":"Last payment on 2019-01-15."},
      {"id":3,"text":"Plaintiff claims ownership of the account."}
    ],

        Output the allegations as a JSON array.
    `;
}

export function generateDraftPrompt({
  allegations,
  questionnaire,
  pdf_content,
}: {
  allegations: {
    id: number;
    text: string;
  }[];
  questionnaire: Questionnaire;
  pdf_content: string;
}) {
  const encodedAllegations = encode(allegations);
  const encodedPdfContent = encode(pdf_content);
  return `You are a legal document assistant. Generate a complete Answer to a civil lawsuit complaint in markdown format.
        Important notes:
-  All responses in the Answer document must refer to the "  Defendant" in the third person 
(e.g., "Defendant denies", "Defendant asserts", "Defendant lacks knowledge"). 
Do NOT use "I" or "me" except inside the Certificate of Service section.
IMPORTANT OUTPUT FORMAT:
- Return ONLY plain markdown text content
- Do NOT wrap the output in code blocks (no \`\`\`markdown or \`\`\`)
- Do NOT include file extensions or format indicators
- Return the markdown content directly as a string
- Use standard markdown syntax for formatting (headers, lists, bold, etc.)

COMPLAINT ALLEGATIONS:
${encodedAllegations}

CASE INFORMATION:
- State: ${questionnaire.state}
- County: ${questionnaire.county}
- Court: ${questionnaire.courtName}
- Case Number: ${questionnaire.caseNumber}

DEBT INFORMATION:
- Amount Claimed: $${questionnaire.debtAmount || "Not specified"}
- Do you owe this debt?: ${questionnaire.oweDebt}
- Last Payment Date: ${questionnaire.lastPaymentDate || "Not specified"}
- Properly Served?: ${questionnaire.properlyServed}

FDCPA VIOLATIONS (if applicable):
${
  Object.entries(questionnaire.fdcpaViolations)
    .filter(([_, value]) => value)
    .map(([key]) => `- ${key.replace(/([A-Z])/g, " $1").trim()}`)
    .join("\n") || "None reported"
}

ORIGINAL COMPLAINT TEXT:
${encodedPdfContent.substring(0, 2000)}${
    encodedPdfContent.length > 2000 ? "..." : ""
  }

INSTRUCTIONS:
Generate a complete Answer document in markdown format that includes:

1. CASE CAPTION (at the top):
   - Court name
   - Case number
   - Plaintiff vs Defendant
   - State and county

2. RESPONSES TO ALLEGATIONS:
   For each allegation numbered ${allegations
     .map((a) => a.id)
     .join(", ")}, respond with:
   - "ADMITS" if true
   - "DENIES" if false
   - "LACKS SUFFICIENT KNOWLEDGE" if uncertain
   Format as: "Allegation [number]: [response]"

3. AFFIRMATIVE DEFENSES:
   Include relevant defenses such as:
   - Statute of limitations (if applicable)
   - Lack of standing
   - Amount in dispute
   - FDCPA violations (if any were checked)
   - Improper service (if not properly served)
   - Failure to state a claim

4. SIGNATURE BLOCK:
   - Pro se format
   - Date
   - Signature line

5. CERTIFICATE OF SERVICE (if required by state):
   - Statement of service method
   - Date of service

OUTPUT: Return the complete Answer document as plain markdown text. Do not wrap in code blocks or add any file format indicators
.`;
}
