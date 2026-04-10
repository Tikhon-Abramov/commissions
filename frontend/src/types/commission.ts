export type CommissionBalance = {
  date: string;
  amount: number;
  debtToRegion?: number;
};

export type CommissionHistoryItem = {
  date: string;
  action: string;
  author: string;
};

export type CompanyRevenueByYear = {
  year: string;
  value: number | null;
};

export type CompanyHeadcountByYear = {
  year: string;
  value: number | null;
};

export type PreviousPeriodItem = {
  date: string;
  ensBalance: number;
  regionalDebt: number;
};

export type EnforcementMeasures = {
  requirementExists?: boolean;
  decision46Exists?: boolean;
  постановления47Count?: number;
  debt47Amount?: number;
  zvsp48Count?: number;
  zvspDebtAmount?: number;
};

export type CommissionItem = {
  inn: string;
  name: string;
  region: string;
  kno: string;
  balances: CommissionBalance[];
  commissionStatus?: string;
  interactionStatus?: string;
  protocolFileName?: string;
  employeeDebtorsCount?: number;
  employeeDebtAmount?: number;
};

export type CommissionCard = {
  inn: string;
  name: string;
  region: string;
  kno: string;
  oktmo?: string;
  employeeDebtorsCount?: number;
  realEstateObjectsCount?: number;
  landPlotsCount?: number;
  transportCount?: number;
  address?: string;
  okved?: string;
  revenueByYear?: CompanyRevenueByYear[];
  headcountByYear?: CompanyHeadcountByYear[];
  balances: CommissionBalance[];
  previousPeriods?: PreviousPeriodItem[];
  enforcement?: EnforcementMeasures;
  director?: string;
  phone?: string;
  history: CommissionHistoryItem[];
};

export type CommissionForm = {
  commissionStatus: string;
  interactionStatus: string;
  commissionDate: string;
  measures: boolean;
  protocolFileName?: string;
  comment: string;
  influenceMeasures?: string;
  authorityParticipation?: string;
};

export type CommissionSummaryItem = {
  label: string;
  value: string;
};