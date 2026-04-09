import type { SummaryMetric } from '../../types/common';
import type { RatingIndicator, RatingTopRow } from '../../types/rating';

export const ratingSummary: SummaryMetric[] = [
  { label: 'Место региона в рейтинге', value: '12' },
  { label: 'Муниципальных образований', value: '187' },
  { label: 'Кол-во НП', value: '34 500' },
  { label: 'Отрицательное сальдо ЕНС', value: '2.4 млрд ₽' },
];

export const ratingIndicators: RatingIndicator[] = [
  {
    code: 'DTI',
    name: 'Соотношение долга к поступлениям',
    place: 7,
    value: '0.18',
    averageRf: '0.23',
    bestPractice: 'Снижение за 3 квартала подряд',
  },
];

export const topBest: RatingTopRow[] = [{ title: 'МО Северное', rating: 96 }];
export const topWorst: RatingTopRow[] = [{ title: 'МО Южное', rating: 34 }];
