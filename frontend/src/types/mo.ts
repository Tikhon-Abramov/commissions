export interface MoTableRow {
  oktmo: string;
  name: string;
  companies: number;
  employees: number;
  debtors: number;
  debtShare: number;
  debtAmount: number;
  rating: number;
}

export interface CompanyDebtRow {
  inn: string;
  name: string;
  debtAmount: number;
  employees: number;
  debtors: number;
  debtShare: number;
  bailiff?: boolean;
  isBudget?: boolean;
}
