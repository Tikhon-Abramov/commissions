import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { DataTable } from '../components/common/DataTable';
import { FilterBar } from '../components/common/FilterBar';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryGrid } from '../components/common/SummaryGrid';
import { moCompanies, moMunicipalities, moSummary } from '../features/mo/mockData';
import { setCompanies, setMoFilters, setMoSummary, setMunicipalities } from '../features/mo/moSlice';
import type { MoTableRow, CompanyDebtRow } from '../types/mo';

export function MoPage() {
  const dispatch = useAppDispatch();
  const { summary, municipalities, companies, filters } = useAppSelector((state) => state.mo);

  useEffect(() => {
    dispatch(setMoSummary({ summary: moSummary, budgetSummary: moSummary, nonBudgetSummary: moSummary }));
    dispatch(setMunicipalities(moMunicipalities));
    dispatch(setCompanies(moCompanies));
  }, [dispatch]);

  return (
    <>
      <PageHeader
        title="Долг второго уровня"
        description="Экран замены mo.php: отдельные summary-блоки, фильтры, список МО и нижний список организаций-должников."
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
            onChange: (value) => dispatch(setMoFilters({ region: value })),
          },
          {
            key: 'period',
            label: 'Период',
            type: 'select',
            value: filters.period,
            options: [
              { value: '', label: 'Все периоды' },
              { value: '2026-03', label: 'Март 2026' },
            ],
            onChange: (value) => dispatch(setMoFilters({ period: value })),
          },
          {
            key: 'search',
            label: 'Поиск',
            value: filters.search,
            onChange: (value) => dispatch(setMoFilters({ search: value })),
          },
        ]}
      />
      <DataTable<MoTableRow>
        columns={[
          { key: 'oktmo', title: 'ОКТМО', render: (row) => row.oktmo },
          { key: 'name', title: 'Наименование МО', render: (row) => row.name },
          { key: 'companies', title: 'Предприятий', render: (row) => row.companies },
          { key: 'employees', title: 'Сотрудников', render: (row) => row.employees },
          { key: 'debtors', title: 'Должников', render: (row) => row.debtors },
          { key: 'rating', title: 'Рейтинг', render: (row) => row.rating },
        ]}
        data={municipalities}
      />
      <div style={{ height: 20 }} />
      <DataTable<CompanyDebtRow>
        columns={[
          { key: 'inn', title: 'ИНН', render: (row) => row.inn },
          { key: 'name', title: 'Наименование', render: (row) => row.name },
          { key: 'debtAmount', title: 'Сумма долга', render: (row) => `${row.debtAmount.toLocaleString('ru-RU')} тыс. ₽` },
          { key: 'employees', title: 'Сотрудники', render: (row) => row.employees },
          { key: 'debtors', title: 'Должники', render: (row) => row.debtors },
          { key: 'debtShare', title: 'Доля должников', render: (row) => `${row.debtShare}%` },
        ]}
        data={companies}
      />
    </>
  );
}
