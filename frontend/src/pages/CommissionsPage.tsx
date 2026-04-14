import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { PageHeader } from '../components/common/PageHeader';
import { useAppSelector } from '../app/hooks';
import { apiRequest } from '../lib/api';
import type {
    CommissionItemDto,
    CommissionsListResponse,
    CommissionsMetaOption,
    CommissionsMetaResponse,
    CommissionsSummaryResponse,
} from '../types/commissionsApi';

const PAGE_SIZE = 50;

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
    overflow-y: auto;
    max-height: calc(100dvh - 360px);
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
    position: sticky;
    top: 0;
    z-index: 2;
`;

const Cell = styled.td`
    padding: 12px 10px;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: top;
`;

const NumberCell = styled(Cell)`
    width: 56px;
    white-space: nowrap;
`;

const TaxpayerCell = styled(Cell)`
    width: 240px;
    min-width: 240px;
    max-width: 240px;
`;

const TaxpayerLink = styled.button`
    display: grid;
    gap: 4px;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.primary};
    width: 100%;
`;

const TaxpayerInn = styled.span`
    font-weight: 700;
    line-height: 1.2;
    word-break: break-word;
`;

const TaxpayerName = styled.span`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.25;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const BalanceValue = styled.div`
  line-height: 1.2;
`;

const BalancePercent = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ $positive, $negative, theme }) => {
    if ($negative) return '#16a34a';
    if ($positive) return '#dc2626';
    return theme.colors.muted;
}};
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

const BottomLoaderRow = styled.div`
  padding: 14px 16px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
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

const uniqueByInn = (items: CommissionItemDto[]) => {
    const map = new Map<string, CommissionItemDto>();

    for (const item of items) {
        if (!map.has(item.inn)) {
            map.set(item.inn, item);
        }
    }

    return Array.from(map.values());
};

export function CommissionsPage() {
    const { isAdmin } = useAppSelector((state) => state.auth);

    const [regionOptions, setRegionOptions] = useState<CommissionsMetaOption[]>([]);
    const [quarterOptions, setQuarterOptions] = useState<CommissionsMetaOption[]>([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedQuarter, setSelectedQuarter] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    const [list, setList] = useState<CommissionItemDto[]>([]);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [nextOffset, setNextOffset] = useState(0);

    const [summary, setSummary] = useState({
        taxpayersCount: 0,
        ensDebt: 0,
        commissionsDone: 0,
        employeeDebtorsCount: 0,
        employeeDebtAmount: 0,
    });

    const [loadingMeta, setLoadingMeta] = useState(true);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');

    const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearch(searchInput.trim());
        }, 350);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

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

    const buildParams = (offset: number, limit: number) => {
        const params = new URLSearchParams();

        if (selectedQuarter) params.set('quarter', selectedQuarter);
        if (selectedRegion) params.set('region', selectedRegion);
        if (selectedStatus) params.set('status', selectedStatus);
        if (search) params.set('search', search);
        params.set('offset', String(offset));
        params.set('limit', String(limit));

        return params;
    };

    const buildSummaryParams = () => {
        const params = new URLSearchParams();

        if (selectedQuarter) params.set('quarter', selectedQuarter);
        if (selectedRegion) params.set('region', selectedRegion);
        if (search) params.set('search', search);

        return params;
    };

    const resetAndLoad = async () => {
        if (!selectedQuarter) return;

        const currentRequestId = ++requestIdRef.current;

        setLoadingList(true);
        setLoadingSummary(true);
        setLoadingMore(false);
        setError('');

        setList([]);
        setTotal(0);
        setHasMore(false);
        setNextOffset(0);

        try {
            const [listResponse, summaryResponse] = await Promise.all([
                apiRequest<CommissionsListResponse>(
                    `/commissions?${buildParams(0, PAGE_SIZE).toString()}`,
                ),
                apiRequest<CommissionsSummaryResponse>(
                    `/commissions/summary?${buildSummaryParams().toString()}`,
                ),
            ]);

            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            const uniqueItems = uniqueByInn(listResponse.data.items);

            setList(uniqueItems);
            setTotal(listResponse.data.total);
            setHasMore(listResponse.data.hasMore);
            setNextOffset(listResponse.data.nextOffset);
            setSummary(summaryResponse.data);
        } catch (err) {
            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            setError(err instanceof Error ? err.message : 'Ошибка загрузки списка');
            setList([]);
            setTotal(0);
            setHasMore(false);
            setNextOffset(0);
            setSummary({
                taxpayersCount: 0,
                ensDebt: 0,
                commissionsDone: 0,
                employeeDebtorsCount: 0,
                employeeDebtAmount: 0,
            });
        } finally {
            if (currentRequestId === requestIdRef.current) {
                setLoadingList(false);
                setLoadingSummary(false);
            }
        }
    };

    useEffect(() => {
        resetAndLoad();
    }, [selectedQuarter, selectedRegion, selectedStatus, search]);

    const loadMore = async () => {
        if (!hasMore || loadingMore || loadingList || !selectedQuarter) return;

        const currentRequestId = requestIdRef.current;

        setLoadingMore(true);
        setError('');

        try {
            const response = await apiRequest<CommissionsListResponse>(
                `/commissions?${buildParams(nextOffset, PAGE_SIZE).toString()}`,
            );

            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            setList((prev) => uniqueByInn([...prev, ...response.data.items]));

            setTotal(response.data.total);
            setHasMore(response.data.hasMore);
            setNextOffset(response.data.nextOffset);
        } catch (err) {
            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            setError(err instanceof Error ? err.message : 'Ошибка подгрузки данных');
        } finally {
            if (currentRequestId === requestIdRef.current) {
                setLoadingMore(false);
            }
        }
    };

    useEffect(() => {
        const node = bottomSentinelRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting) {
                    loadMore();
                }
            },
            {
                rootMargin: '200px',
            },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [bottomSentinelRef.current, hasMore, loadingMore, loadingList, nextOffset, selectedQuarter, selectedRegion, selectedStatus, search]);

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


    const handleOpenDetails = (item: CommissionItemDto) => {
        console.log('open commission modal', item);
    };

    return (
        <PageWrap>
            <PageHeader
                title="Комиссии"
                description="Список налогоплательщиков и динамика задолженности по выбранному кварталу."
            />

            <SummaryGrid>
                <SummaryCard>
                    <SummaryLabel>Количество НП</SummaryLabel>
                    <SummaryValue>
                        {loadingSummary ? '...' : summary.taxpayersCount.toLocaleString('ru-RU')}
                    </SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Сальдо ЕНС</SummaryLabel>
                    <SummaryValue>
                        {loadingSummary ? '...' : `${formatMoney(summary.ensDebt)} ₽`}
                    </SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Проведённых комиссий</SummaryLabel>
                    <SummaryValue>
                        {loadingSummary ? '...' : summary.commissionsDone.toLocaleString('ru-RU')}
                    </SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Сотрудников-должников</SummaryLabel>
                    <SummaryValue>
                        {loadingSummary ? '...' : summary.employeeDebtorsCount.toLocaleString('ru-RU')}
                    </SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Задолженность сотрудников</SummaryLabel>
                    <SummaryValue>
                        {loadingSummary ? '...' : `${formatMoney(summary.employeeDebtAmount)} ₽`}
                    </SummaryValue>
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
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
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
                        <HeadCell rowSpan={2}>№</HeadCell>
                        <HeadCell rowSpan={2}>ИНН, наименование</HeadCell>
                        <HeadCell colSpan={dateColumns.length || 1}>
                            Совокупная задолженность на
                        </HeadCell>
                        <HeadCell rowSpan={2}>Проведение комиссии</HeadCell>
                        <HeadCell rowSpan={2}>Результат взаимодействия с НП</HeadCell>
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
                            <Cell colSpan={6 + Math.max(dateColumns.length, 1)}>
                                Загрузка данных...
                            </Cell>
                        </tr>
                    ) : !list.length ? (
                        <tr>
                            <Cell colSpan={6 + Math.max(dateColumns.length, 1)}>
                                Данные не найдены
                            </Cell>
                        </tr>
                    ) : (
                        list.map((item, index) => {
                            const balanceMap = new Map(
                                item.balances.map((balance) => [
                                    balance.date,
                                    Number(balance.amount || 0),
                                ]),
                            );

                            return (
                                <tr key={`${item.inn}-${index}`}>
                                    <NumberCell>{index + 1}</NumberCell>

                                    <TaxpayerCell>
                                        <TaxpayerLink type="button" onClick={() => handleOpenDetails(item)}>
                                            <TaxpayerInn>{item.inn}</TaxpayerInn>
                                            <TaxpayerName>{item.name}</TaxpayerName>
                                        </TaxpayerLink>
                                    </TaxpayerCell>

                                    {dateColumns.length ? (
                                        dateColumns.map((column, balanceIndex) => {
                                            const amount = balanceMap.get(column.key);
                                            const prevAmount =
                                                balanceIndex + 1 < dateColumns.length
                                                    ? balanceMap.get(dateColumns[balanceIndex + 1].key)
                                                    : undefined;

                                            let percentValue: number | null = null;

                                            if (
                                                typeof amount === 'number' &&
                                                typeof prevAmount === 'number' &&
                                                prevAmount !== 0
                                            ) {
                                                percentValue = ((amount - prevAmount) / prevAmount) * 100;
                                            }

                                            return (
                                                <Cell key={`${item.inn}-${column.key}`}>
                                                    {typeof amount === 'number' ? (
                                                        <>
                                                            <BalanceValue>{formatMoney(amount)} ₽</BalanceValue>
                                                            {percentValue !== null ? (
                                                                <BalancePercent
                                                                    $positive={percentValue > 0}
                                                                    $negative={percentValue < 0}
                                                                >
                                                                    {`${percentValue > 0 ? '+' : ''}${percentValue.toFixed(1)}%`}
                                                                </BalancePercent>
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

                                    <Cell>{item.commissionStatus || '—'}</Cell>
                                    <Cell>{item.interactionStatus || '—'}</Cell>

                                    <Cell>
                                        {item.protocolFileName ? <ProtocolMark>📎</ProtocolMark> : '—'}
                                    </Cell>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </Table>

                <BottomLoaderRow ref={bottomSentinelRef}>
                    {loadingMore
                        ? 'Подгрузка ещё...'
                        : hasMore
                            ? `Загружено ${list.length} из ${total}`
                            : list.length
                                ? `Показаны все записи: ${list.length}`
                                : ''}
                </BottomLoaderRow>
            </TableWrap>
        </PageWrap>
    );
}