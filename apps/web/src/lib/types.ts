export type Allegation = {
  id: number;
  text: string;
};

export type Step = 1 | 2 | 3 | 4;

export type OweDebt = "yes" | "no" | "partially" | "unsure" | "";
export type ProperlyServed = "yes" | "no" | "unsure" | "";

export type Questionnaire = {
  state: string;
  county: string;
  caseNumber: string;
  courtName: string;
  debtAmount: string;
  oweDebt: OweDebt;
  lastPaymentDate: string;
  properlyServed: ProperlyServed;
  fdcpaViolations: {
    illegalThreats: boolean;
    falseStatements: boolean;
    harassment: boolean;
    earlyCalls: boolean;
    employerContact: boolean;
    ceaseDesistIgnored: boolean;
    thirdPartyDisclosure: boolean;
    miniMirandaMissing: boolean;
  };
};

export const INITIAL_QUESTIONNAIRE: Questionnaire = {
  state: "",
  county: "",
  caseNumber: "",
  courtName: "",
  debtAmount: "",
  oweDebt: "",
  lastPaymentDate: "",
  properlyServed: "",
  fdcpaViolations: {
    illegalThreats: false,
    falseStatements: false,
    harassment: false,
    earlyCalls: false,
    employerContact: false,
    ceaseDesistIgnored: false,
    thirdPartyDisclosure: false,
    miniMirandaMissing: false,
  },
};

export const US_STATES = [
  "New York",
  "California",
  "Texas",
  "Florida",
  "Illinois",
];
