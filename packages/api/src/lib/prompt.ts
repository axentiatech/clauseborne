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
