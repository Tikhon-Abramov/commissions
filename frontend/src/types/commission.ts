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

export type CommissionItem = {
  inn: string;
  name: string;
  region: string;
  kno: string;
  balances: CommissionBalance[];
  commissionStatus?: string;
  interactionStatus?: string;
  protocolFileName?: string;

  // Для верхних динамических блоков
  employeeDebtorsCount?: number;
  employeeDebtAmount?: number;
};

export type CommissionCard = {
  inn: string;
  name: string;
  region: string;
  kno: string;
  address: string;
  director: string;
  phone: string;
  balances: CommissionBalance[];
  history: CommissionHistoryItem[];
};

export type CommissionForm = {
  commissionStatus: string;
  interactionStatus: string;
  commissionDate: string;
  measures: boolean;
  protocolFileName?: string;
  comment: string;
};

export type CommissionSummaryItem = {
  label: string;
  value: string;
};