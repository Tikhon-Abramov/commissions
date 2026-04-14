import { useEffect, useMemo, useRef, useState, memo } from 'react';
import styled from 'styled-components';
import { PageHeader } from '../components/common/PageHeader';
import { useAppSelector } from '../app/hooks';
import {
    useGetCommissionsMetaQuery,
    useGetCommissionsPageQuery,
    useGetCommissionsSummaryQuery,
    type CommissionItemDto,
} from '../features/commissions/commissionsApi';

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
    position: sticky;
    top: 0;
    z-index: 2;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Cell = styled.td`
    padding: 12px 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: top;
    color: ${({ theme }) => theme.colors.text};
    font-size: 13px;
`;

const NumberCell = styled(Cell)`
    width: 60px;
`;

const TaxpayerLink = styled.button`
    border: none;
    background: transparent;
    padding: 0;
    text-align: left;
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
`;

const ProtocolMark = styled.span`
    display: inline-flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
`;

const DeltaText = styled.div<{ $positive: boolean; $negative: boolean }>`
    font-size: 12px;
    color: ${({ $positive, $negative, theme }) => {
        if ($negative) return '#16a34a';
        if ($positive) return '#dc2626';
        return theme.colors.muted;
    }};
`;

const BottomLoader = styled.div`
    padding: 14px 16px;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
`;

const formatMoney = (value: number) => Math.round(value).toLocaleString('ru-RU');
const formatDateLabel = (value: string) => {
    const [y, m, d] = value.split('-');
    return `${d}.${m}.${y}`;
};

const Row = memo(function Row({
                                  item,
                                  index,
                                  dateColumns,
                                  onOpen,
                              }: {
    item: CommissionItemDto;
    index: number;
    dateColumns: string[];
    onOpen: (item: CommissionItemDto) => void;
}) {
    const balanceMap = new Map(item.balances.map((b) => [b.date, b.amount]));

    return (
        <tr>
            <NumberCell>{index + 1}</NumberCell>
            <Cell style={{ width: 240, maxWidth: 240 }}>
                <TaxpayerLink type="button" onClick={() => onOpen(item)}>
                    <div style={{ fontWeight: 700, wordBreak: 'break-word' }}>{item.inn}</div>
                    <div style={{ color: 'inherit', wordBreak: 'break-word', lineHeight: 1.25 }}>
                        {item.name}
                    </div>
                </TaxpayerLink>
            </Cell>

            {dateColumns.map((date, idx) => {
                const amount = balanceMap.get(date);
                const prev = idx + 1 < dateColumns.length ? balanceMap.get(dateColumns[idx + 1]) : undefined;

                let delta: number | null = null;
                if (typeof amount === 'number' && typeof prev === 'number' && prev !== 0) {
                    delta = ((amount - prev) / prev) * 100;
                }

                return (
                    <Cell key={`${item.inn}-${date}`}>
                        {typeof amount === 'number' ? (
                            <>
                                <div>{formatMoney(amount)} ₽</div>
                                {delta !== null ? (
                                    <DeltaText $positive={delta > 0} $negative={delta < 0}>
                                        {`${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`}
                                    </DeltaText>
                                ) : null}
                            </>
                        ) : (
                            '—'
                        )}
                    </Cell>
                );
            })}

            <Cell>{item.commissionStatus || '—'}</Cell>
            <Cell>{item.interactionStatus || '—'}</Cell>
            <Cell>{item.protocolFileName ? <ProtocolMark>📎</ProtocolMark> : '—'}</Cell>
        </tr>
    );
});

export function CommissionsPage() {
    const { isAdmin } = useAppSelector((state) => state.auth);

    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedQuarter, setSelectedQuarter] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [cursor, setCursor] = useState<string | null>(null);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const { data: meta, isLoading: metaLoading } = useGetCommissionsMetaQuery();

    useEffect(() => {
        if (!meta) return;
        setSelectedQuarter((prev) => prev || meta.defaultQuarter || '');
        if (!meta.isAdmin) {
            setSelectedRegion(meta.userRegion || '');
        }
    }, [meta]);

    useEffect(() => {
        const id = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setCursor(null);
        }, 250);

        return () => window.clearTimeout(id);
    }, [searchInput]);

    useEffect(() => {
        setCursor(null);
    }, [selectedQuarter, selectedRegion, selectedStatus]);

    const pageArgs = {
        quarter: selectedQuarter,
        region: selectedRegion,
        search,
        status: selectedStatus,
        cursor,
        limit: PAGE_SIZE,
    };

    const { data: pageData, isFetching: pageFetching } = useGetCommissionsPageQuery(pageArgs, {
        skip: !selectedQuarter,
    });

    const { data: summary, isFetching: summaryFetching } = useGetCommissionsSummaryQuery(
        {
            quarter: selectedQuarter,
            region: selectedRegion,
        },
        { skip: !selectedQuarter },
    );

    const items = pageData?.items ?? [];
    const dateColumns = pageData?.dates ?? [];

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !pageData?.hasMore || pageFetching) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && pageData.nextCursor) {
                    setCursor(pageData.nextCursor);
                }
            },
            { rootMargin: '300px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [pageData?.hasMore, pageData?.nextCursor, pageFetching]);

    const handleOpenDetails = (item: CommissionItemDto) => {
        console.log('open modal', item.inn);
    };

    return (
        <PageWrap>
            <PageHeader title="Комиссии" description="Оптимизированная загрузка по курсору." />

            <SummaryGrid>
                <SummaryCard>
                    <SummaryLabel>Количество НП</SummaryLabel>
                    <SummaryValue>{summaryFetching ? '...' : (summary?.taxpayersCount ?? 0).toLocaleString('ru-RU')}</SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Сальдо ЕНС</SummaryLabel>
                    <SummaryValue>{summaryFetching ? '...' : `${formatMoney(summary?.ensDebt ?? 0)} ₽`}</SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Проведённых комиссий</SummaryLabel>
                    <SummaryValue>{summaryFetching ? '...' : (summary?.commissionsDone ?? 0).toLocaleString('ru-RU')}</SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Сотрудников-должников</SummaryLabel>
                    <SummaryValue>{summaryFetching ? '...' : (summary?.employeeDebtorsCount ?? 0).toLocaleString('ru-RU')}</SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Задолженность сотрудников</SummaryLabel>
                    <SummaryValue>{summaryFetching ? '...' : `${formatMoney(summary?.employeeDebtAmount ?? 0)} ₽`}</SummaryValue>
                </SummaryCard>
            </SummaryGrid>

            <FiltersCard>
                <FiltersRow>
                    {isAdmin ? (
                        <Select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} disabled={metaLoading}>
                            <option value="">Все регионы</option>
                            {meta?.regions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </Select>
                    ) : null}

                    <Select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)} disabled={metaLoading}>
                        {meta?.quarters.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </Select>

                    <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="">Все статусы</option>
                        <option value="Комиссия проведена">Комиссия проведена</option>
                        <option value="Неявка на комиссию">Неявка на комиссию</option>
                        <option value="Не требуется проведение комиссии">Не требуется проведение комиссии</option>
                    </Select>

                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Поиск по ИНН или наименованию"
                    />
                </FiltersRow>
            </FiltersCard>

            <TableWrap>
                <Table>
                    <thead>
                    <tr>
                        <HeadCell rowSpan={2}>№</HeadCell>
                        <HeadCell rowSpan={2}>ИНН, наименование</HeadCell>
                        <HeadCell colSpan={dateColumns.length || 1}>Совокупная задолженность на</HeadCell>
                        <HeadCell rowSpan={2}>Проведение комиссии</HeadCell>
                        <HeadCell rowSpan={2}>Результат взаимодействия с НП</HeadCell>
                        <HeadCell rowSpan={2}>Протокол</HeadCell>
                    </tr>
                    <tr>
                        {dateColumns.length
                            ? dateColumns.map((date) => <HeadCell key={date}>{formatDateLabel(date)}</HeadCell>)
                            : <HeadCell>Нет данных</HeadCell>}
                    </tr>
                    </thead>

                    <tbody>
                    {items.map((item, index) => (
                        <Row
                            key={`${item.inn}-${index}`}
                            item={item}
                            index={index}
                            dateColumns={dateColumns}
                            onOpen={handleOpenDetails}
                        />
                    ))}
                    </tbody>
                </Table>

                <BottomLoader ref={sentinelRef}>
                    {pageFetching ? 'Подгрузка…' : pageData?.hasMore ? 'Прокрутите ниже для загрузки' : 'Все записи загружены'}
                </BottomLoader>
            </TableWrap>
        </PageWrap>
    );
}