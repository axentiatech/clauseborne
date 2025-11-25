import type { Questionnaire } from "./types";

export const fdcpaList: {
  key: keyof Questionnaire["fdcpaViolations"];
  label: string;
}[] = [
  { key: "illegalThreats", label: "Threats of illegal action" },
  { key: "falseStatements", label: "False statements about debt amount" },
  { key: "harassment", label: "Harassment or abuse" },
  { key: "earlyCalls", label: "Calls before 8am or after 9pm" },
  { key: "employerContact", label: "Contacting your employer" },
  {
    key: "ceaseDesistIgnored",
    label: "Continued contact after cease & desist",
  },
  {
    key: "thirdPartyDisclosure",
    label: "Disclosed debt to third parties",
  },
  {
    key: "miniMirandaMissing",
    label: "Missing Mini-Miranda warning in calls/letters",
  },
];
