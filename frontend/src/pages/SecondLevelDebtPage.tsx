import { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { DataTable } from '../components/common/DataTable';
import { FilterBar, type FilterField } from '../components/common/FilterBar';
import { PageHeader } from '../components/common/PageHeader';
import { DebtCardModal } from '../components/secondLevelDebt/DebtCardModal';
import {
    closeDebtCard,
    openDebtCard,
    setSecondLevelDebtData,
    setSecondLevelDebtFilters,
    setSelectedMo,
} from '../features/secondLevelDebt/secondLevelDebtSlice';
import {
    secondLevelDebtCardsByInn,
    secondLevelDebtMoList,
    secondLevelDebtTaxpayerList,
} from '../features/secondLevelDebt/mockData';
import type { DebtMoItem, DebtSummaryBlock, DebtTaxpayerItem } from '../types/secondLevelDebt';

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`;

const ToolbarActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 600;
`;

const Note = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
`;

const SummaryStack = styled.div`
  display: grid;
  gap: 16px;
  margin-bottom: 18px;
`;

const SummaryCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 18px;
  padding: 16px;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 14px;
  font-size: 16px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Metric = styled.div`
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  padding: 14px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const MetricValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-top: 8px;
`;

const SectionTitle = styled.h3`
  margin: 22px 0 12px;
  font-size: 18px;
`;

const LinkButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
`;

const TaxpayerTypeBadge = styled.span<{ $budget?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  background: ${({ $budget, theme }) =>
    $budget ? 'rgba(59, 130, 246, 0.12)' : theme.colors.primarySoft};
  color: ${({ $budget, theme }) => ($budget ? '#2563eb' : theme.colors.primary)};
`;

const FsspBadge = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  background: ${({ $active, theme }) =>
    $active ? 'rgba(239, 68, 68, 0.12)' : theme.colors.surfaceAlt};
  color: ${({ $active, theme }) => ($active ? theme.colors.danger : theme.colors.muted)};
`;

const formatAmount = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const formatPercent = (employeesCount: number, debtorsCount: number) => {
    if (!employeesCount) return '0 %';
    return `${((debtorsCount / employeesCount) * 100).toFixed(1).replace('.', ',')} %`;
};

const formatDateLabel = (value: string) => {
    const [year, month, day] = value.split('-');
    return `${day}.${month}.${year}`;
};

const getLatestAvailableDate = (items: Array<{ date: string }>) => {
    const dates = Array.from(new Set(items.map((item) => item.date))).sort((a, b) => b.localeCompare(a));
    return dates[0] ?? '';
};

const makeSummaryBlock = (
    title: string,
    items: DebtMoItem[],
    date: string,
): DebtSummaryBlock => {
    const moCount = new Set(items.map((item) => item.oktmo)).size;
    const enterprises = items.reduce((acc, item) => acc + item.enterprisesCount, 0);
    const employees = items.reduce((acc, item) => acc + item.employeesCount, 0);
    const debtors = items.reduce((acc, item) => acc + item.debtorsCount, 0);
    const debtAmount = items.reduce((acc, item) => acc + item.debtAmount, 0);

    return {
        title: `${title} на ${formatDateLabel(date)}`,
        date,
        metrics: [
            { label: 'Муниципальных округов', value: moCount.toLocaleString('ru-RU') },
            { label: 'Предприятий', value: enterprises.toLocaleString('ru-RU') },
            { label: 'Сотрудников', value: employees.toLocaleString('ru-RU') },
            { label: 'Должников', value: debtors.toLocaleString('ru-RU') },
            { label: 'Задолженность', value: formatAmount(debtAmount) },
        ],
    };
};

export function SecondLevelDebtPage() {
    const dispatch = useAppDispatch();
    const { filters, moList, taxpayerList, selectedMoOktmo, selectedCard, isCardOpen } = useAppSelector(
        (state) => state.secondLevelDebt,
    );
    const { isAdmin, region: userRegion } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(
            setSecondLevelDebtData({
                moList: secondLevelDebtMoList,
                taxpayerList: secondLevelDebtTaxpayerList,
            }),
        );
    }, [dispatch]);

    const latestDate = useMemo(() => getLatestAvailableDate(moList), [moList]);

    useEffect(() => {
        if (!filters.date && latestDate) {
            dispatch(setSecondLevelDebtFilters({ date: latestDate }));
        }
    }, [dispatch, filters.date, latestDate]);

    const regionScopedMo = useMemo(() => {
        const activeRegion = isAdmin ? filters.region : userRegion ?? '';
        return moList.filter((item) => (!activeRegion ? true : item.region === activeRegion));
    }, [filters.region, isAdmin, moList, userRegion]);

    const regionScopedTaxpayers = useMemo(() => {
        const activeRegion = isAdmin ? filters.region : userRegion ?? '';
        return taxpayerList.filter((item) => (!activeRegion ? true : item.region === activeRegion));
    }, [filters.region, isAdmin, taxpayerList, userRegion]);

    const summarySource = useMemo(() => {
        return regionScopedMo.filter((item) => item.date === filters.date);
    }, [filters.date, regionScopedMo]);

    const summaryBlocks = useMemo(() => {
        if (!filters.date) return [];

        const totalItems = summarySource;
        const budgetItems = summarySource.filter((item) => item.budgetType === 'budget');
        const nonBudgetItems = summarySource.filter((item) => item.budgetType === 'non-budget');

        return [
            makeSummaryBlock('Сводная информация по региону', totalItems, filters.date),
            makeSummaryBlock('Сводная информация по бюджетным организациям по региону', budgetItems, filters.date),
            makeSummaryBlock('Сводная информация по небюджетным организациям по региону', nonBudgetItems, filters.date),
        ];
    }, [filters.date, summarySource]);

    const moTableData = useMemo(() => {
        let result = regionScopedMo.filter((item) => item.date === filters.date);

        if (filters.budgetType === 'budget') {
            result = result.filter((item) => item.budgetType === 'budget');
        }

        if (filters.budgetType === 'non-budget') {
            result = result.filter((item) => item.budgetType === 'non-budget');
        }

        if (filters.search.trim()) {
            const search = filters.search.trim().toLowerCase();
            result = result.filter(
                (item) =>
                    item.oktmo.toLowerCase().includes(search) ||
                    item.moName.toLowerCase().includes(search),
            );
        }

        return result;
    }, [filters.budgetType, filters.date, filters.search, regionScopedMo]);

    const taxpayerTableData = useMemo(() => {
        if (!selectedMoOktmo) return [];

        let result = regionScopedTaxpayers.filter(
            (item) => item.date === filters.date && item.oktmo === selectedMoOktmo,
        );

        if (filters.budgetType === 'budget') {
            result = result.filter((item) => item.isBudgetOrganization);
        }

        if (filters.budgetType === 'non-budget') {
            result = result.filter((item) => !item.isBudgetOrganization);
        }

        if (filters.search.trim()) {
            const search = filters.search.trim().toLowerCase();
            result = result.filter(
                (item) =>
                    item.inn.includes(search) ||
                    item.name.toLowerCase().includes(search),
            );
        }

        return result;
    }, [filters.budgetType, filters.date, filters.search, regionScopedTaxpayers, selectedMoOktmo]);

    const availableDates = useMemo(() => {
        return Array.from(new Set(regionScopedMo.map((item) => item.date)))
            .sort((a, b) => b.localeCompare(a))
            .map((date) => ({
                value: date,
                label: formatDateLabel(date),
            }));
    }, [regionScopedMo]);

    const filterFields: FilterField[] = [
        ...(isAdmin
            ? [
                {
                    key: 'region',
                    label: 'Регион',
                    type: 'select' as const,
                    value: filters.region,
                    options: [
                        { value: '', label: 'Все регионы' },
                        { value: '77', label: '77 — Москва' },
                        { value: '78', label: '78 — Санкт-Петербург' },
                        { value: '50', label: '50 — Московская область' },
                    ],
                    onChange: (value: string) => {
                        dispatch(setSecondLevelDebtFilters({ region: value }));
                        dispatch(setSelectedMo(null));
                    },
                },
            ]
            : []),
        {
            key: 'date',
            label: 'Дата',
            type: 'select' as const,
            value: filters.date,
            options: availableDates,
            onChange: (value: string) => {
                dispatch(setSecondLevelDebtFilters({ date: value }));
                dispatch(setSelectedMo(null));
            },
        },
        {
            key: 'search',
            label: 'Поиск информации',
            value: filters.search,
            placeholder: 'ОКТМО, МО, ИНН, Наименование',
            onChange: (value: string) => dispatch(setSecondLevelDebtFilters({ search: value })),
        },
        {
            key: 'budgetType',
            label: 'Тип организаций',
            type: 'select' as const,
            value: filters.budgetType,
            options: [
                { value: 'all', label: 'Все бюджетные организации' },
                { value: 'budget', label: 'Только бюджетные организации' },
                { value: 'non-budget', label: 'Все небюджетные организации' },
            ],
            onChange: (value: string) =>
                dispatch(setSecondLevelDebtFilters({ budgetType: value as 'all' | 'budget' | 'non-budget' })),
        },
    ];

    const handleDownloadStats = () => {
        console.log('Скачать статистику', {
            role: isAdmin ? 'admin' : 'user',
            region: isAdmin ? filters.region || 'all' : userRegion,
            date: filters.date,
        });
    };

    const handleDownloadDetails = () => {
        console.log('Скачать детализацию', {
            role: isAdmin ? 'admin' : 'user',
            region: isAdmin ? filters.region || 'all' : userRegion,
            date: filters.date,
        });
    };

    return (
        <>
            <PageHeader
                title="Долг второго уровня"
                description="Сводка по региону, таблица МО, список НП внутри МО и карточка плательщика."
            />

            <Toolbar>
                <Note>
                    По умолчанию загружается крайняя доступная дата. У пользователя регион фиксирован, у администратора регион можно выбрать отдельно.
                </Note>

                <ToolbarActions>
                    <ActionButton type="button" onClick={handleDownloadStats}>
                        Скачать статистику
                    </ActionButton>
                    <ActionButton type="button" onClick={handleDownloadDetails}>
                        Скачать детализацию
                    </ActionButton>
                </ToolbarActions>
            </Toolbar>

            <FilterBar fields={filterFields} />

            <SummaryStack>
                {summaryBlocks.map((block) => (
                    <SummaryCard key={block.title}>
                        <SummaryTitle>{block.title}</SummaryTitle>
                        <SummaryGrid>
                            {block.metrics.map((metric) => (
                                <Metric key={metric.label}>
                                    <MetricLabel>{metric.label}</MetricLabel>
                                    <MetricValue>{metric.value}</MetricValue>
                                </Metric>
                            ))}
                        </SummaryGrid>
                    </SummaryCard>
                ))}
            </SummaryStack>

            <SectionTitle>Муниципальные округа</SectionTitle>

            <DataTable<DebtMoItem>
                emptyText="Нет данных по выбранным параметрам"
                columns={[
                    {
                        key: 'oktmo',
                        title: 'ОКТМО',
                        width: '110px',
                        render: (row) => row.oktmo,
                    },
                    {
                        key: 'moName',
                        title: 'Наименование МО',
                        width: '180px',
                        render: (row) => (
                            <LinkButton type="button" onClick={() => dispatch(setSelectedMo(row.oktmo))}>
                                {row.moName}
                            </LinkButton>
                        ),
                    },
                    {
                        key: 'enterprisesCount',
                        title: 'Общее кол-во предприятий',
                        width: '140px',
                        align: 'center',
                        render: (row) => row.enterprisesCount.toLocaleString('ru-RU'),
                    },
                    {
                        key: 'employeesCount',
                        title: 'Количество сотрудников',
                        width: '135px',
                        align: 'center',
                        render: (row) => row.employeesCount.toLocaleString('ru-RU'),
                    },
                    {
                        key: 'debtorsCount',
                        title: 'Количество должников',
                        width: '130px',
                        align: 'center',
                        render: (row) => row.debtorsCount.toLocaleString('ru-RU'),
                    },
                    {
                        key: 'debtorsShare',
                        title: 'Доля должников к общему количеству сотрудников',
                        width: '170px',
                        align: 'center',
                        render: (row) => formatPercent(row.employeesCount, row.debtorsCount),
                    },
                    {
                        key: 'debtAmount',
                        title: 'Общая сумма задолженности по сотрудникам',
                        width: '170px',
                        align: 'right',
                        render: (row) => formatAmount(row.debtAmount),
                    },
                    {
                        key: 'rating',
                        title: 'Рейтинг',
                        width: '90px',
                        align: 'center',
                        render: (row) => row.rating,
                    },
                ]}
                data={moTableData}
            />

            <SectionTitle>Налогоплательщики внутри МО</SectionTitle>

            <DataTable<DebtTaxpayerItem>
                emptyText={selectedMoOktmo ? 'Нет плательщиков по выбранному МО' : 'Выберите строку МО для просмотра НП'}
                columns={[
                    {
                        key: 'inn',
                        title: 'ИНН',
                        width: '130px',
                        render: (row) => (
                            <LinkButton
                                type="button"
                                onClick={() => {
                                    const card = secondLevelDebtCardsByInn[row.inn];
                                    if (card) dispatch(openDebtCard(card));
                                }}
                            >
                                {row.inn}
                            </LinkButton>
                        ),
                    },
                    {
                        key: 'name',
                        title: 'Наименование',
                        width: '180px',
                        render: (row) => row.name,
                    },
                    {
                        key: 'debtAmount',
                        title: 'Общая сумма задолженности по сотрудникам',
                        width: '170px',
                        align: 'right',
                        render: (row) => formatAmount(row.debtAmount),
                    },
                    {
                        key: 'employeesCount',
                        title: 'Количество сотрудников',
                        width: '120px',
                        align: 'center',
                        render: (row) => row.employeesCount.toLocaleString('ru-RU'),
                    },
                    {
                        key: 'debtorsCount',
                        title: 'Количество должников',
                        width: '120px',
                        align: 'center',
                        render: (row) => row.debtorsCount.toLocaleString('ru-RU'),
                    },
                    {
                        key: 'share',
                        title: 'Доля должников к общему количеству сотрудников',
                        width: '160px',
                        align: 'center',
                        render: (row) => formatPercent(row.employeesCount, row.debtorsCount),
                    },
                    {
                        key: 'employeesLabel',
                        title: 'Сотрудники',
                        width: '110px',
                        align: 'center',
                        render: (row) => row.employeesLabel ?? `${row.employeesCount} / ${row.debtorsCount}`,
                    },
                    {
                        key: 'budget',
                        title: 'БО',
                        width: '90px',
                        align: 'center',
                        render: (row) => (
                            <TaxpayerTypeBadge $budget={row.isBudgetOrganization}>
                                {row.isBudgetOrganization ? 'БО' : '—'}
                            </TaxpayerTypeBadge>
                        ),
                    },
                    {
                        key: 'fssp',
                        title: 'ФССП',
                        width: '90px',
                        align: 'center',
                        render: (row) => <FsspBadge $active={row.hasFssp}>{row.hasFssp ? 'Есть' : '—'}</FsspBadge>,
                    },
                ]}
                data={taxpayerTableData}
            />

            <DebtCardModal
                open={isCardOpen}
                card={selectedCard}
                onClose={() => dispatch(closeDebtCard())}
            />
        </>
    );
}