import type {
  CommissionCard,
  CommissionForm,
  CommissionItem,
  CommissionSummaryItem,
} from '../../types/commission';

export const commissionsSummary: CommissionSummaryItem[] = [];

const testBalances = [
  { date: '2026-03-31', amount: 1820000, debtToRegion: 910000 },
  { date: '2026-03-15', amount: 1760000, debtToRegion: 890000 },
  { date: '2026-02-28', amount: 1690000, debtToRegion: 860000 },
  { date: '2026-02-15', amount: 1640000, debtToRegion: 835000 },
  { date: '2026-01-31', amount: 1580000, debtToRegion: 810000 },
  { date: '2026-01-15', amount: 1510000, debtToRegion: 790000 },
  { date: '2025-12-31', amount: 1490000, debtToRegion: 770000 },
];

export const commissionsList: CommissionItem[] = [
  {
    inn: '7701234567',
    name: 'ООО Альфа',
    region: '77',
    kno: 'ИФНС № 10',
    balances: testBalances,
    commissionStatus: 'Комиссия проведена',
    interactionStatus: 'Погасит частично',
    protocolFileName: 'protocol_7701234567.pdf',
    employeeDebtorsCount: 12,
    employeeDebtAmount: 245000,
  },
  {
    inn: '7802345678',
    name: 'ООО Нева Трейд',
    region: '78',
    kno: 'МИФНС № 11',
    balances: [
      { date: '2026-03-31', amount: 920000, debtToRegion: 470000 },
      { date: '2026-03-15', amount: 980000, debtToRegion: 495000 },
      { date: '2026-02-28', amount: 1040000, debtToRegion: 520000 },
      { date: '2026-02-15', amount: 1090000, debtToRegion: 548000 },
      { date: '2026-01-31', amount: 1160000, debtToRegion: 575000 },
      { date: '2026-01-15', amount: 1190000, debtToRegion: 590000 },
      { date: '2025-12-31', amount: 1240000, debtToRegion: 615000 },
    ],
    commissionStatus: 'Неявка на комиссию',
    interactionStatus: 'Требуется повторный вызов',
    protocolFileName: 'protocol_7802345678.pdf',
    employeeDebtorsCount: 7,
    employeeDebtAmount: 118000,
  },
  {
    inn: '5003456789',
    name: 'АО ТехИнвест',
    region: '50',
    kno: 'ИФНС № 5',
    balances: [
      { date: '2026-03-31', amount: 2410000, debtToRegion: 1220000 },
      { date: '2026-03-15', amount: 2380000, debtToRegion: 1200000 },
      { date: '2026-02-28', amount: 2320000, debtToRegion: 1170000 },
      { date: '2026-02-15', amount: 2280000, debtToRegion: 1145000 },
      { date: '2026-01-31', amount: 2210000, debtToRegion: 1115000 },
      { date: '2026-01-15', amount: 2150000, debtToRegion: 1080000 },
      { date: '2025-12-31', amount: 2080000, debtToRegion: 1040000 },
    ],
    commissionStatus: 'Не требуется проведение комиссии',
    interactionStatus: 'Погашен добровольно',
    protocolFileName: 'protocol_5003456789.pdf',
    employeeDebtorsCount: 19,
    employeeDebtAmount: 367000,
  },
];

export const commissionCardsByInn: Record<string, CommissionCard> = {
  '7701234567': {
    inn: '7701234567',
    name: 'ООО Альфа',
    region: '77',
    kno: 'ИФНС № 10',
    address: 'г. Москва, ул. Примерная, д. 10',
    director: 'Иванов И.И.',
    phone: '+7 (999) 000-00-01',
    balances: testBalances,
    history: [
      { date: '2026-03-31', action: 'Обновление задолженности', author: 'Оператор' },
      { date: '2026-03-18', action: 'Загружен протокол', author: 'Инспектор' },
    ],
  },
  '7802345678': {
    inn: '7802345678',
    name: 'ООО Нева Трейд',
    region: '78',
    kno: 'МИФНС № 11',
    address: 'г. Санкт-Петербург, Невский пр., д. 15',
    director: 'Петров П.П.',
    phone: '+7 (999) 000-00-02',
    balances: [
      { date: '2026-03-31', amount: 920000, debtToRegion: 470000 },
      { date: '2026-03-15', amount: 980000, debtToRegion: 495000 },
      { date: '2026-02-28', amount: 1040000, debtToRegion: 520000 },
      { date: '2026-02-15', amount: 1090000, debtToRegion: 548000 },
      { date: '2026-01-31', amount: 1160000, debtToRegion: 575000 },
      { date: '2026-01-15', amount: 1190000, debtToRegion: 590000 },
      { date: '2025-12-31', amount: 1240000, debtToRegion: 615000 },
    ],
    history: [
      { date: '2026-03-20', action: 'Назначена повторная комиссия', author: 'Инспектор' },
    ],
  },
  '5003456789': {
    inn: '5003456789',
    name: 'АО ТехИнвест',
    region: '50',
    kno: 'ИФНС № 5',
    address: 'Московская область, г. Химки, ул. Заводская, д. 3',
    director: 'Сидоров С.С.',
    phone: '+7 (999) 000-00-03',
    balances: [
      { date: '2026-03-31', amount: 2410000, debtToRegion: 1220000 },
      { date: '2026-03-15', amount: 2380000, debtToRegion: 1200000 },
      { date: '2026-02-28', amount: 2320000, debtToRegion: 1170000 },
      { date: '2026-02-15', amount: 2280000, debtToRegion: 1145000 },
      { date: '2026-01-31', amount: 2210000, debtToRegion: 1115000 },
      { date: '2026-01-15', amount: 2150000, debtToRegion: 1080000 },
      { date: '2025-12-31', amount: 2080000, debtToRegion: 1040000 },
    ],
    history: [
      { date: '2026-03-10', action: 'Завершено взаимодействие', author: 'Оператор' },
    ],
  },
};

export const commissionFormByInn: Record<string, CommissionForm> = {
  '7701234567': {
    commissionStatus: 'Комиссия проведена',
    interactionStatus: 'Погасит частично',
    commissionDate: '2026-03-18',
    measures: true,
    protocolFileName: 'protocol_7701234567.pdf',
    comment: 'Плательщик подтвердил частичное погашение в течение 10 дней.',
  },
  '7802345678': {
    commissionStatus: 'Неявка на комиссию',
    interactionStatus: 'Требуется повторный вызов',
    commissionDate: '2026-03-20',
    measures: false,
    protocolFileName: 'protocol_7802345678.pdf',
    comment: 'Подготовить повторное приглашение.',
  },
  '5003456789': {
    commissionStatus: 'Не требуется проведение комиссии',
    interactionStatus: 'Погашен добровольно',
    commissionDate: '2026-03-12',
    measures: false,
    protocolFileName: 'protocol_5003456789.pdf',
    comment: 'Задолженность погашена до проведения комиссии.',
  },
};