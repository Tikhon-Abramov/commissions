import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { DataTable } from '../components/common/DataTable';
import { FilterBar } from '../components/common/FilterBar';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryGrid } from '../components/common/SummaryGrid';
import { ratingIndicators, ratingSummary, topBest, topWorst } from '../features/rating/mockData';
import { setRatingFilters, setRatingIndicators, setRatingSummary, setRatingTops } from '../features/rating/ratingSlice';
import type { RatingIndicator, RatingTopRow } from '../types/rating';

export function RatingPage() {
  const dispatch = useAppDispatch();
  const { summary, indicators, filters, topBest: best, topWorst: worst } = useAppSelector((state) => state.rating);

  useEffect(() => {
    dispatch(setRatingSummary(ratingSummary));
    dispatch(setRatingIndicators(ratingIndicators));
    dispatch(setRatingTops({ topBest, topWorst }));
  }, [dispatch]);

  return (
    <>
      <PageHeader
        title="Рейтинг МО"
        description="Экран замены rating.php: сводка, фильтры, таблица показателей региона и отдельные блоки top/bottom муниципалитетов."
      />
      <SummaryGrid metrics={summary} />
      <FilterBar
        fields={[
          {
            key: 'region',
            label: 'Регион',
            type: 'select',
            value: filters.region,
            options: [
              { value: '', label: 'Все регионы' },
              { value: '77', label: '77 — Москва' },
            ],
            onChange: (value) => dispatch(setRatingFilters({ region: value })),
          },
          {
            key: 'period',
            label: 'Период',
            type: 'select',
            value: filters.period,
            options: [
              { value: '', label: 'Все периоды' },
              { value: '2026-Q1', label: '1 кв. 2026' },
            ],
            onChange: (value) => dispatch(setRatingFilters({ period: value })),
          },
        ]}
      />
      <DataTable<RatingIndicator>
        columns={[
          { key: 'name', title: 'Показатель', render: (row) => row.name },
          { key: 'place', title: 'Место', render: (row) => row.place },
          { key: 'value', title: 'Значение', render: (row) => row.value },
          { key: 'averageRf', title: 'Среднее по РФ', render: (row) => row.averageRf },
          { key: 'bestPractice', title: 'Передовая практика', render: (row) => row.bestPractice ?? '—' },
        ]}
        data={indicators}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        <DataTable<RatingTopRow>
          columns={[
            { key: 'title', title: 'Топ-5 лучших МО', render: (row) => row.title },
            { key: 'rating', title: 'Рейтинг', render: (row) => row.rating },
          ]}
          data={best}
        />
        <DataTable<RatingTopRow>
          columns={[
            { key: 'title', title: 'Топ-5 худших МО', render: (row) => row.title },
            { key: 'rating', title: 'Рейтинг', render: (row) => row.rating },
          ]}
          data={worst}
        />
      </div>
    </>
  );
}
