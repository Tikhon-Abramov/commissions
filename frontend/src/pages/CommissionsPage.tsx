import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PageHeader } from '../components/common/PageHeader';
import { useAppSelector } from '../app/hooks';
import { apiRequest } from '../lib/api';
import type {
    CommissionItemDto,
    CommissionsListResponse,
    CommissionsMetaOption,
    CommissionsMetaResponse,
} from '../types/commissionsApi';

const PageWrap = styled.div`
  display: grid;
  gap: 18px;
`;

const FiltersCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 18px;
  padding: 16px;
  display: grid;
  gap: 12px;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const Select = styled.select`
  height: 42px;
  min-width: 220px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  height: 42px;
  min-width: 280px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 18px;
  padding: 16px;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const SummaryValue = styled.div`
  margin-top: 8px;
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.surface};
`;

const Table = styled.table`
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
`;

const HeadCell = styled.th`
  padding: 12px 10px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Cell = styled.td`
  padding: 12px 10px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: top;
`;

const ErrorText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
`;

const LoadingText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;

const ProtocolMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

type DateColumn = {
    key: string;
    label: string;
};

const formatMoney = (value: number) => {
    return Math.round(value).toLocaleString('ru-RU');
};

const formatDateLabel = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
};

const getCurrentQuarterCode = () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `${now.getFullYear()}-Q${quarter}`;
};

export function CommissionsPage() {
    const { isAdmin } = useAppSelector((state) => state.auth);

    const [regionOptions, setRegionOptions] = useState<CommissionsMetaOption[]>([]);
    const [quarterOptions, setQuarterOptions] = useState<CommissionsMetaOption[]>([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedQuarter, setSelectedQuarter] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [search, setSearch] = useState('');

    const [list, setList] = useState<CommissionItemDto[]>([]);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [loadingList, setLoadingList] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadMeta = async () => {
            setLoadingMeta(true);
            setError('');

            try {
                const response = await apiRequest<CommissionsMetaResponse>('/commissions/meta');

                setRegionOptions(response.data.regions);
                setQuarterOptions(response.data.quarters);

                const currentQuarter = getCurrentQuarterCode();
                const quarterExists = response.data.quarters.some(
                    (item) => item.value === currentQuarter,
                );

                setSelectedQuarter(
                    response.data.defaultQuarter ||
                    (quarterExists
                        ? currentQuarter
                        : response.data.quarters[0]?.value || currentQuarter),
                );

                if (response.data.isAdmin) {
                    setSelectedRegion('');
                } else {
                    setSelectedRegion(response.data.userRegion || '');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка загрузки фильтров');
            } finally {
                setLoadingMeta(false);
            }
        };

        loadMeta();
    }, []);

    useEffect(() => {
        if (!selectedQuarter) return;

        const loadList = async () => {
            setLoadingList(true);
            setError('');

            try {
                const params = new URLSearchParams();

                if (selectedQuarter) params.set('quarter', selectedQuarter);
                if (selectedRegion) params.set('region', selectedRegion);
                if (selectedStatus) params.set('status', selectedStatus);
                if (search.trim()) params.set('search', search.trim());

                const response = await apiRequest<CommissionsListResponse>(
                    `/commissions?${params.toString()}`,
                );

                setList(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка загрузки списка');
            } finally {
                setLoadingList(false);
            }
        };

        loadList();
    }, [selectedQuarter, selectedRegion, selectedStatus, search]);

    const dateColumns = useMemo<DateColumn[]>(() => {
        const allDates = new Set<string>();

        list.forEach((item) => {
            item.balances.forEach((balance) => {
                allDates.add(balance.date);
            });
        });

        return Array.from(allDates)
            .sort((a, b) => b.localeCompare(a))
            .slice(0, 7)
            .map((date) => ({
                key: date,
                label: formatDateLabel(date),
            }));
    }, [list]);

    const summary = useMemo(() => {
        const taxpayersCount = list.length;
        const ensDebt = list.reduce((acc, item) => {
            const latest = item.balances[0];
            return acc + Number(latest?.amount || 0);
        }, 0);
        const commissionsDone = list.filter(
            (item) => item.commissionStatus === 'Комиссия проведена',
        ).length;
        const employeeDebtorsCount = list.reduce(
            (acc, item) => acc + Number(item.employeeDebtorsCount || 0),
            0,
        );
        const employeeDebtAmount = list.reduce(
            (acc, item) => acc + Number(item.employeeDebtAmount || 0),
            0,
        );

        return {
            taxpayersCount,
            ensDebt,
            commissionsDone,
            employeeDebtorsCount,
            employeeDebtAmount,
        };
    }, [list]);

    return (
        <PageWrap>
            <PageHeader
                title="Комиссии"
                description="Список налогоплательщиков и динамика задолженности по выбранному кварталу."
            />

            <SummaryGrid>
                <SummaryCard>
                    <SummaryLabel>Количество НП</SummaryLabel>
                    <SummaryValue>{summary.taxpayersCount.toLocaleString('ru-RU')}</SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Сальдо ЕНС</SummaryLabel>
                    <SummaryValue>{formatMoney(summary.ensDebt)} ₽</SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Проведённых комиссий</SummaryLabel>
                    <SummaryValue>{summary.commissionsDone.toLocaleString('ru-RU')}</SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Сотрудников-должников</SummaryLabel>
                    <SummaryValue>
                        {summary.employeeDebtorsCount.toLocaleString('ru-RU')}
                    </SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Задолженность сотрудников</SummaryLabel>
                    <SummaryValue>{formatMoney(summary.employeeDebtAmount)} ₽</SummaryValue>
                </SummaryCard>
            </SummaryGrid>

            <FiltersCard>
                <FiltersRow>
                    {isAdmin ? (
                        <Select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            disabled={loadingMeta}
                        >
                            <option value="">Все регионы</option>
                            {regionOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </Select>
                    ) : null}

                    <Select
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(e.target.value)}
                        disabled={loadingMeta}
                    >
                        {quarterOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </Select>

                    <Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">Все статусы</option>
                        <option value="Комиссия проведена">Комиссия проведена</option>
                        <option value="Неявка на комиссию">Неявка на комиссию</option>
                        <option value="Не требуется проведение комиссии">
                            Не требуется проведение комиссии
                        </option>
                    </Select>

                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Поиск по ИНН или наименованию"
                    />
                </FiltersRow>

                {loadingMeta ? <LoadingText>Загрузка фильтров...</LoadingText> : null}
                {error ? <ErrorText>{error}</ErrorText> : null}
            </FiltersCard>

            <TableWrap>
                <Table>
                    <thead>
                    <tr>
                        <HeadCell rowSpan={2}>ИНН / НП</HeadCell>
                        <HeadCell rowSpan={2}>Результат взаимодействия</HeadCell>
                        <HeadCell colSpan={dateColumns.length || 1}>
                            Совокупная задолженность на
                        </HeadCell>
                        <HeadCell rowSpan={2}>Протокол</HeadCell>
                    </tr>
                    <tr>
                        {dateColumns.length ? (
                            dateColumns.map((column) => (
                                <HeadCell key={column.key}>{column.label}</HeadCell>
                            ))
                        ) : (
                            <HeadCell>Нет данных</HeadCell>
                        )}
                    </tr>
                    </thead>

                    <tbody>
                    {loadingList ? (
                        <tr>
                            <Cell colSpan={4 + Math.max(dateColumns.length, 1)}>
                                Загрузка данных...
                            </Cell>
                        </tr>
                    ) : !list.length ? (
                        <tr>
                            <Cell colSpan={4 + Math.max(dateColumns.length, 1)}>
                                Данные не найдены
                            </Cell>
                        </tr>
                    ) : (
                        list.map((item) => {
                            const balanceMap = new Map(
                                item.balances.map((balance) => [balance.date, Number(balance.amount || 0)]),
                            );

                            return (
                                <tr key={item.inn}>
                                    <Cell>
                                        <div>{item.inn}</div>
                                        <div>{item.name}</div>
                                    </Cell>

                                    <Cell>{item.interactionStatus || item.commissionStatus || '—'}</Cell>

                                    {dateColumns.length ? (
                                        dateColumns.map((column, index) => {
                                            const amount = balanceMap.get(column.key);
                                            const prevAmount =
                                                index + 1 < dateColumns.length
                                                    ? balanceMap.get(dateColumns[index + 1].key)
                                                    : undefined;

                                            let percentText = '';

                                            if (
                                                typeof amount === 'number' &&
                                                typeof prevAmount === 'number' &&
                                                prevAmount !== 0
                                            ) {
                                                const diff = ((amount - prevAmount) / prevAmount) * 100;
                                                const sign = diff > 0 ? '+' : '';
                                                percentText = `${sign}${diff.toFixed(1)}%`;
                                            }

                                            return (
                                                <Cell key={`${item.inn}-${column.key}`}>
                                                    {typeof amount === 'number' ? (
                                                        <>
                                                            <div>{formatMoney(amount)} ₽</div>
                                                            {percentText ? (
                                                                <div style={{ fontSize: 12, opacity: 0.7 }}>
                                                                    {percentText}
                                                                </div>
                                                            ) : null}
                                                        </>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </Cell>
                                            );
                                        })
                                    ) : (
                                        <Cell>—</Cell>
                                    )}

                                    <Cell>
                                        {item.protocolFileName ? <ProtocolMark>📎</ProtocolMark> : '—'}
                                    </Cell>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </Table>
            </TableWrap>
        </PageWrap>
    );
}