import { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { DataTable } from '../components/common/DataTable';
import { FilterBar, type FilterField } from '../components/common/FilterBar';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryGrid } from '../components/common/SummaryGrid';
import { CommissionCardModal } from '../components/commissions/CommissionCardModal';
import {
    commissionCardsByInn,
    commissionFormByInn,
    commissionsList,
} from '../features/commissions/mockData';
import {
    applyCommissionForm,
    closeCommissionCard,
    openCommissionCard,
    setCommissionFilters,
    setCommissionsList,
    updateCommissionForm,
} from '../features/commissions/commissionsSlice';
import type { CommissionBalance, CommissionItem, CommissionSummaryItem } from '../types/commission';

const Toolbar = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
`;

const Note = styled.div`
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
`;

const LinkButton = styled.button`
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    padding: 0;
    cursor: pointer;
    text-align: left;
    font-weight: 600;
    font-size: 13px;
`;

const NameText = styled.div`
    font-size: 12px;
    line-height: 1.3;
    margin-top: 2px;
`;

const Badge = styled.span<{ $tone?: 'success' | 'warning' | 'danger' | 'neutral' }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 5px 8px;
    font-size: 11px;
    line-height: 1.2;
    background: ${({ $tone, theme }) => {
        if ($tone === 'success') return theme.colors.primarySoft;
        if ($tone === 'warning') return 'rgba(245, 158, 11, 0.14)';
        if ($tone === 'danger') return 'rgba(239, 68, 68, 0.14)';
        return theme.colors.surfaceAlt;
    }};
    color: ${({ $tone, theme }) => {
        if ($tone === 'warning') return theme.colors.warning;
        if ($tone === 'danger') return theme.colors.danger;
        if ($tone === 'success') return theme.colors.primary;
        return theme.colors.text;
    }};
`;

const PeriodCell = styled.div`
    display: grid;
    place-items: center;
    gap: 2px;
    min-width: 0;
`;

const AmountText = styled.div`
    font-weight: 700;
    white-space: nowrap;
    font-size: 12px;
`;

const EmptyPeriod = styled.span`
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
`;

const ResultText = styled.div`
    font-size: 12px;
    line-height: 1.25;
    word-break: break-word;
`;

const ProtocolIcon = styled.span<{ $attached: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    font-size: 14px;
    background: ${({ $attached, theme }) =>
            $attached ? theme.colors.primarySoft : theme.colors.surfaceAlt};
    color: ${({ $attached, theme }) =>
            $attached ? theme.colors.primary : theme.colors.muted};
`;

const DeltaText = styled.div<{ $positive: boolean; $negative: boolean }>`
    font-size: 10px;
    line-height: 1.15;
    white-space: nowrap;
    color: ${({ theme, $positive, $negative }) => {
        if ($positive) return theme.colors.danger;
        if ($negative) return theme.colors.primary;
        return theme.colors.muted;
    }};
`;

const formatAmount = (value: number) => value.toLocaleString('ru-RU');

const formatSummaryCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const formatColumnDate = (value: string) => {
    const [year, month, day] = value.split('-');
    return `${day}.${month}.${year}`;
};

const getStatusTone = (value?: string) => {
    if (!value) return 'neutral' as const;
    if (value.includes('проведена') || value.includes('Погасит') || value.includes('погашен')) return 'success' as const;
    if (value.includes('Неявка') || value.includes('Отказ')) return 'danger' as const;
    return 'warning' as const;
};

const getQuarterCode = (date: string) => {
    const parsed = new Date(date);
    const month = parsed.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    return `${parsed.getFullYear()}-Q${quarter}`;
};

const getBalanceByDate = (balances: CommissionBalance[], date: string) =>
    balances.find((item) => item.date === date);

const getLatestBalanceAmount = (balances: CommissionBalance[]) => {
    if (!balances.length) return 0;
    const sorted = [...balances].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0]?.amount ?? 0;
};

const isFirstDateInMonth = (date: string, allDates: string[]) => {
    const [year, month] = date.split('-');
    const sameMonthDates = allDates.filter((item) => item.startsWith(`${year}-${month}-`));
    return sameMonthDates[0] === date;
};

const getPreviousMonthComparableDate = (date: string, allDates: string[]) => {
    const [year, month, day] = date.split('-').map(Number);
    const previousMonthDate = new Date(year, month - 2, day);
    const prevYear = previousMonthDate.getFullYear();
    const prevMonth = String(previousMonthDate.getMonth() + 1).padStart(2, '0');

    return (
        allDates.find((item) => {
            const [candidateYear, candidateMonth, candidateDay] = item.split('-').map(Number);
            return (
                candidateYear === prevYear &&
                candidateMonth === Number(prevMonth) &&
                candidateDay === day
            );
        }) ?? null
    );
};

const getDeltaPercent = (
    balances: CommissionBalance[],
    currentDate: string,
    allDates: string[],
) => {
    if (isFirstDateInMonth(currentDate, allDates)) {
        return null;
    }

    const currentBalance = getBalanceByDate(balances, currentDate);
    const comparableDate = getPreviousMonthComparableDate(currentDate, allDates);

    if (!currentBalance || !comparableDate) {
        return null;
    }

    const previousBalance = getBalanceByDate(balances, comparableDate);

    if (!previousBalance || previousBalance.amount === 0) {
        return null;
    }

    return ((currentBalance.amount - previousBalance.amount) / previousBalance.amount) * 100;
};

const formatDelta = (value: number) => {
    const rounded = Math.abs(value).toFixed(1).replace('.', ',');
    if (value > 0) return `+${rounded}%`;
    if (value < 0) return `-${rounded}%`;
    return `0,0%`;
};

export function CommissionsPage() {
    const dispatch = useAppDispatch();
    const { list, filters, selectedCard, isCardOpen, currentForm } = useAppSelector((state) => state.commissions);
    const { isAdmin, region: userRegion } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(setCommissionsList(commissionsList));
    }, [dispatch]);

    const regionScopedList = useMemo(() => {
        const activeRegion = isAdmin ? filters.region : userRegion ?? '';

        return list.filter((item) => {
            const regionMatches = !activeRegion || item.region === activeRegion;
            const quarterMatches =
                !filters.quarter || item.balances.some((balance) => getQuarterCode(balance.date) === filters.quarter);

            return regionMatches && quarterMatches;
        });
    }, [filters.quarter, filters.region, isAdmin, list, userRegion]);

    const filteredList = useMemo(() => {
        return regionScopedList.filter((item) => {
            const searchValue = filters.search.trim().toLowerCase();
            const searchMatches =
                !searchValue ||
                item.inn.includes(searchValue) ||
                item.name.toLowerCase().includes(searchValue);

            const statusMatches = !filters.status || item.commissionStatus === filters.status;

            return searchMatches && statusMatches;
        });
    }, [filters.search, filters.status, regionScopedList]);

    const summary = useMemo<CommissionSummaryItem[]>(() => {
        const npCount = filteredList.length;

        const ensBalance = filteredList.reduce((acc, item) => {
            return acc + getLatestBalanceAmount(item.balances);
        }, 0);

        const completedCommissions = filteredList.filter(
            (item) => item.commissionStatus === 'Комиссия проведена',
        ).length;

        const employeeDebtors = filteredList.reduce((acc, item) => {
            return acc + (item.employeeDebtorsCount ?? 0);
        }, 0);

        const employeeDebt = filteredList.reduce((acc, item) => {
            return acc + (item.employeeDebtAmount ?? 0);
        }, 0);

        return [
            { label: 'Количество НП', value: formatAmount(npCount) },
            { label: 'Сальдо ЕНС', value: formatSummaryCurrency(ensBalance) },
            { label: 'Проведённых комиссий', value: formatAmount(completedCommissions) },
            { label: 'Сотрудников-должников', value: formatAmount(employeeDebtors) },
            { label: 'Задолженность сотрудников', value: formatSummaryCurrency(employeeDebt) },
        ];
    }, [filteredList]);

    const balanceDates = useMemo(() => {
        const uniqueDates = new Set<string>();

        regionScopedList.forEach((item) => {
            item.balances.forEach((balance) => {
                uniqueDates.add(balance.date);
            });
        });

        return Array.from(uniqueDates).sort((a, b) => b.localeCompare(a)).slice(0, 7);
    }, [regionScopedList]);

    const openCard = (row: CommissionItem) => {
        const card = commissionCardsByInn[row.inn];
        const form = commissionFormByInn[row.inn];

        if (card && form) {
            dispatch(openCommissionCard({ card, form }));
        }
    };

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
                    onChange: (value: string) => dispatch(setCommissionFilters({ region: value })),
                },
            ]
            : []),
        {
            key: 'quarter',
            label: 'Квартал',
            type: 'select' as const,
            value: filters.quarter,
            options: [
                { value: '', label: 'Все кварталы' },
                { value: '2026-Q1', label: '1 кв. 2026' },
                { value: '2025-Q4', label: '4 кв. 2025' },
            ],
            onChange: (value: string) => dispatch(setCommissionFilters({ quarter: value })),
        },
        {
            key: 'status',
            label: 'Статус комиссии',
            type: 'select' as const,
            value: filters.status,
            options: [
                { value: '', label: 'Все статусы' },
                { value: 'Комиссия проведена', label: 'Комиссия проведена' },
                { value: 'Не требуется проведение комиссии', label: 'Не требуется проведение комиссии' },
                { value: 'Неявка на комиссию', label: 'Неявка на комиссию' },
            ],
            onChange: (value: string) => dispatch(setCommissionFilters({ status: value })),
        },
        {
            key: 'search',
            label: 'Поиск по ИНН / наименованию',
            placeholder: '7701234567 или ООО Альфа',
            value: filters.search,
            onChange: (value: string) => dispatch(setCommissionFilters({ search: value })),
        },
    ];

    return (
        <>
            <PageHeader
                title="Комиссии"
                description="Основной список плательщиков, динамика задолженности по датам, карточка ИНН и сохранение результата комиссии."
            />

            <SummaryGrid metrics={summary} />

            <Toolbar>
                <Note>
                    Верхние показатели пересчитываются динамически по текущему отфильтрованному списку.
                </Note>
            </Toolbar>

            <FilterBar fields={filterFields} />

            <DataTable<CommissionItem>
                emptyText="По текущим фильтрам записи не найдены"
                groupHeaders={[
                    { title: '', span: 1 },
                    { title: 'Совокупная задолженность на', span: balanceDates.length },
                    { title: '', span: 3 },
                ]}
                columns={[
                    {
                        key: 'inn',
                        title: 'ИНН / НП',
                        width: '220px',
                        render: (row) => (
                            <div>
                                <LinkButton type="button" onClick={() => openCard(row)}>
                                    {row.inn}
                                </LinkButton>
                                <NameText>{row.name}</NameText>
                            </div>
                        ),
                    },
                    ...balanceDates.map((date) => ({
                        key: `balance-${date}`,
                        title: formatColumnDate(date),
                        width: '92px',
                        align: 'center' as const,
                        render: (row: CommissionItem) => {
                            const balance = getBalanceByDate(row.balances, date);
                            const delta = getDeltaPercent(row.balances, date, balanceDates);

                            if (!balance) {
                                return <EmptyPeriod>—</EmptyPeriod>;
                            }

                            return (
                                <PeriodCell>
                                    <AmountText>{formatAmount(balance.amount)}</AmountText>
                                    {delta !== null ? (
                                        <DeltaText $positive={delta > 0} $negative={delta < 0}>
                                            {formatDelta(delta)}
                                        </DeltaText>
                                    ) : null}
                                </PeriodCell>
                            );
                        },
                    })),
                    {
                        key: 'commissionStatus',
                        title: 'Проведение комиссии',
                        width: '150px',
                        align: 'center' as const,
                        render: (row) => (
                            <Badge $tone={getStatusTone(row.commissionStatus)}>
                                {row.commissionStatus ?? '—'}
                            </Badge>
                        ),
                    },
                    {
                        key: 'interactionStatus',
                        title: 'Результат взаимодействия',
                        width: '125px',
                        render: (row) => <ResultText>{row.interactionStatus ?? '—'}</ResultText>,
                    },
                    {
                        key: 'protocolFileName',
                        title: 'Протокол',
                        width: '72px',
                        align: 'center' as const,
                        render: (row) => (
                            <ProtocolIcon
                                $attached={Boolean(row.protocolFileName)}
                                title={row.protocolFileName ? 'Файл прикреплен' : 'Файл отсутствует'}
                            >
                                {row.protocolFileName ? '📎' : '—'}
                            </ProtocolIcon>
                        ),
                    },
                ]}
                data={filteredList}
            />

            <CommissionCardModal
                open={isCardOpen}
                card={selectedCard}
                form={currentForm}
                onClose={() => dispatch(closeCommissionCard())}
                onSave={() => dispatch(applyCommissionForm())}
                onChange={(patch) => dispatch(updateCommissionForm(patch))}
            />
        </>
    );
}