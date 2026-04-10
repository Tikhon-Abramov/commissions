export type DebtSnapshot = {
    date: string;
    employeesCount: number;
    debtorsCount: number;
    debtAmount: number;
};

export type DebtMoItem = {
    oktmo: string;
    moName: string;
    region: string;
    date: string;
    enterprisesCount: number;
    employeesCount: number;
    debtorsCount: number;
    debtAmount: number;
    rating: number;
    budgetType: 'budget' | 'non-budget';
};

export type DebtTaxpayerItem = {
    inn: string;
    name: string;
    region: string;
    oktmo: string;
    moName: string;
    date: string;
    debtAmount: number;
    employeesCount: number;
    debtorsCount: number;
    employeesLabel?: string;
    isBudgetOrganization?: boolean;
    hasFssp?: boolean;
    address?: string;
    okved?: string;
    kno?: string;
};

export type DebtSummaryMetric = {
    label: string;
    value: string;
};

export type DebtSummaryBlock = {
    title: string;
    date: string;
    metrics: DebtSummaryMetric[];
};

export type DebtCard = {
    inn: string;
    name: string;
    kno?: string;
    oktmo?: string;
    address?: string;
    okved?: string;
    employeesCount: number;
    debtorsCount: number;
    debtAmount: number;
};