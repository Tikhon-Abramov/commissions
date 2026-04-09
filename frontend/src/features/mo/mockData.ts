import type { SummaryMetric } from '../../types/common';
import type { CompanyDebtRow, MoTableRow } from '../../types/mo';

export const moSummary: SummaryMetric[] = [
  { label: 'Муниципальных округов', value: '24' },
  { label: 'Предприятий', value: '18 240' },
  { label: 'Сотрудников', value: '527 400' },
  { label: 'Должников', value: '18 950' },
  { label: 'Задолженность', value: '184 млн ₽' },
];

export const moMunicipalities: MoTableRow[] = [
  {
    oktmo: '46701000',
    name: 'Городской округ Примерный',
    companies: 821,
    employees: 15220,
    debtors: 712,
    debtShare: 4.67,
    debtAmount: 13450,
    rating: 82,
  },
];

export const moCompanies: CompanyDebtRow[] = [
  {
    inn: '5001002003',
    name: 'МУП Водоканал',
    debtAmount: 980,
    employees: 220,
    debtors: 24,
    debtShare: 10.9,
    bailiff: true,
    isBudget: true,
  },
];
