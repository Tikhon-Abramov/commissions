import { useEffect, useMemo, useRef, useState, memo } from 'react';
import styled, { keyframes } from 'styled-components';
import { PageHeader } from '../components/common/PageHeader';
import { useAppSelector } from '../app/hooks';
import { apiRequest } from '../lib/api';
import {
    useGetCommissionsMetaQuery,
    useGetCommissionsPageQuery,
    useGetCommissionsSummaryQuery,
    type CommissionItemDto,
} from '../features/commissions/commissionsApi';
import type { CommissionDetailsResponse } from '../types/commissionDetails';
import { CommissionDetailsDrawer } from '../components/commissions/CommissionDetailsDrawer';

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
  position: sticky;
  top: 0;
  z-index: 2;
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  font-weight: 700;
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

const ProtocolMark = styled.span`
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
`;

const BottomLoader = styled.div`
  padding: 14px 16px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
`;

const ErrorText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
`;

const LoadingText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;

const overlayFade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const drawerIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 1200;
  animation: ${overlayFade} 0.22s ease;
`;

const Drawer = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  width: min(860px, 100vw);
  height: 100dvh;
  background: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: -16px 0 40px rgba(0, 0, 0, 0.14);
  z-index: 1201;
  display: grid;
  grid-template-rows: auto 1fr auto;
  animation: ${drawerIn} 0.24s ease;
`;

const DrawerHeader = styled.div`
  padding: 20px 20px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const DrawerTitle = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

const DrawerBody = styled.div`
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 18px 20px 20px;
  display: grid;
  gap: 18px;
`;

const DrawerFooter = styled.div`
  padding: 14px 20px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, $primary }) => ($primary ? '#fff' : theme.colors.text)};
  cursor: pointer;
`;

const Section = styled.section`
  display: grid;
  gap: 10px;
`;

const SectionTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.background};
  padding: 12px;
  min-width: 0;
`;

const Label = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Value = styled.div`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  line-height: 1.35;
  word-break: break-word;
`;

const EditorGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
`;

const FieldLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const FieldInput = styled.input`
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const FieldTextarea = styled.textarea`
  min-height: 96px;
  resize: vertical;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const HistoryTable = styled.div`
  display: grid;
  gap: 8px;
`;

const HistoryRow = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr 1fr;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.background};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const HistoryList = styled.div`
  display: grid;
  gap: 8px;
`;

const HistoryChangeCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.background};
`;

const formatMoney = (value: number) => Math.round(value).toLocaleString('ru-RU');

const formatDateLabel = (value: string) => {
    const [y, m, d] = value.split('-');
    return `${d}.${m}.${y}`;
};

const displayOrDash = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
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

            <TaxpayerCell>
                <TaxpayerLink type="button" onClick={() => onOpen(item)}>
                    <TaxpayerInn>{item.inn}</TaxpayerInn>
                    <TaxpayerName>{item.name}</TaxpayerName>
                </TaxpayerLink>
            </TaxpayerCell>

            {dateColumns.map((date, idx) => {
                const amount = balanceMap.get(date);
                const prev =
                    idx + 1 < dateColumns.length ? balanceMap.get(dateColumns[idx + 1]) : undefined;

                let delta: number | null = null;
                if (typeof amount === 'number' && typeof prev === 'number' && prev !== 0) {
                    delta = ((amount - prev) / prev) * 100;
                }

                return (
                    <Cell key={`${item.inn}-${date}`}>
                        {typeof amount === 'number' ? (
                            <>
                                <BalanceValue>{formatMoney(amount)} ₽</BalanceValue>
                                {delta !== null ? (
                                    <BalancePercent $positive={delta > 0} $negative={delta < 0}>
                                        {`${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`}
                                    </BalancePercent>
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

    const [selectedInn, setSelectedInn] = useState<string | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsSaving, setDetailsSaving] = useState(false);
    const [detailsError, setDetailsError] = useState('');
    const [details, setDetails] = useState<CommissionDetailsResponse['data'] | null>(null);
    const [selectedProtocolFiles, setSelectedProtocolFiles] = useState<File[]>([]);

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

    const {
        data: pageData,
        isFetching: pageFetching,
        refetch: refetchPage,
    } = useGetCommissionsPageQuery(pageArgs, {
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

    const handleOpenDetails = async (item: CommissionItemDto) => {
        setSelectedInn(item.inn);
        setDetails(null);
        setDetailsError('');
        setDetailsLoading(true);

        try {
            const params = new URLSearchParams();
            if (selectedQuarter) params.set('quarter', selectedQuarter);
            if (selectedRegion) params.set('region', selectedRegion);

            const response = await apiRequest<CommissionDetailsResponse>(
                `/commissions/${item.inn}/details?${params.toString()}`,
            );

            setDetails(response.data);
        } catch (err) {
            setDetailsError(err instanceof Error ? err.message : 'Ошибка загрузки карточки');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleSaveDetails = async () => {
        if (!selectedInn || !details) return;

        setDetailsSaving(true);
        setDetailsError('');

        try {
            const params = new URLSearchParams();
            if (selectedQuarter) params.set('quarter', selectedQuarter);
            if (selectedRegion) params.set('region', selectedRegion);

            let response: CommissionDetailsResponse;

            if (selectedProtocolFiles.length) {
                const formData = new FormData();
                formData.append('commissionStatus', details.commission.comEvents || '');
                formData.append('commissionDate', details.commission.comDate || '');
                formData.append('interactionStatus', details.event.events || '');
                formData.append('impactMeasures', details.commission.impactMeasures || '');
                formData.append('ogvOmsuParticipation', details.commission.ogvOmsuParticipation || '');
                formData.append('note', details.commission.note || '');

                selectedProtocolFiles.forEach((file) => {
                    formData.append('protocolFile', file);
                });

                response = await apiRequest<CommissionDetailsResponse>(
                    `/commissions/${selectedInn}/details?${params.toString()}`,
                    {
                        method: 'PUT',
                        body: formData,
                    },
                );
            } else {
                response = await apiRequest<CommissionDetailsResponse>(
                    `/commissions/${selectedInn}/details?${params.toString()}`,
                    {
                        method: 'PUT',
                        json: {
                            commissionStatus: details.commission.comEvents,
                            commissionDate: details.commission.comDate,
                            interactionStatus: details.event.events,
                            impactMeasures: details.commission.impactMeasures,
                            ogvOmsuParticipation: details.commission.ogvOmsuParticipation,
                            note: details.commission.note,
                        },
                    },
                );
            }

            setDetails(response.data);
            setSelectedProtocolFiles([]);
            await refetchPage();
        } catch (err) {
            setDetailsError(err instanceof Error ? err.message : 'Ошибка сохранения');
        } finally {
            setDetailsSaving(false);
        }
    };

    const handleDeleteProtocol = async (fileId: number | null) => {
        if (!fileId || !selectedInn) return;

        const params = new URLSearchParams();
        if (selectedQuarter) params.set('quarter', selectedQuarter);
        if (selectedRegion) params.set('region', selectedRegion);

        try {
            setDetailsError('');

            await apiRequest<{ success: true; data: { deletedId: number } }>(
                `/commissions/${selectedInn}/protocol/${fileId}?${params.toString()}`,
                {
                    method: 'DELETE',
                },
            );

            const refreshed = await apiRequest<CommissionDetailsResponse>(
                `/commissions/${selectedInn}/details?${params.toString()}`,
            );

            setDetails(refreshed.data);
            await refetchPage();
        } catch (err) {
            setDetailsError(err instanceof Error ? err.message : 'Ошибка удаления файла');
        }
    };

    const handleDownloadProtocol = async (fileId: number | null) => {
        if (!fileId) return;

        const params = new URLSearchParams();
        if (selectedQuarter) params.set('quarter', selectedQuarter);
        if (selectedRegion) params.set('region', selectedRegion);

        window.open(
            `http://localhost:4000/api/commissions/${selectedInn}/protocol/${fileId}?${params.toString()}`,
            '_blank',
        );
    };

    const closeDetailsModal = () => {
        setSelectedInn(null);
        setDetails(null);
        setDetailsError('');
    };

    const previousPeriods = useMemo(() => details?.previousPeriods ?? [], [details]);
    const historyChanges = useMemo(() => details?.changesHistory ?? [], [details]);

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
                        {summaryFetching ? '...' : (summary?.taxpayersCount ?? 0).toLocaleString('ru-RU')}
                    </SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Сальдо ЕНС</SummaryLabel>
                    <SummaryValue>
                        {summaryFetching ? '...' : `${formatMoney(summary?.ensDebt ?? 0)} ₽`}
                    </SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Проведённых комиссий</SummaryLabel>
                    <SummaryValue>
                        {summaryFetching ? '...' : (summary?.commissionsDone ?? 0).toLocaleString('ru-RU')}
                    </SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Сотрудников-должников</SummaryLabel>
                    <SummaryValue>
                        {summaryFetching ? '...' : (summary?.employeeDebtorsCount ?? 0).toLocaleString('ru-RU')}
                    </SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Задолженность сотрудников</SummaryLabel>
                    <SummaryValue>
                        {summaryFetching ? '...' : `${formatMoney(summary?.employeeDebtAmount ?? 0)} ₽`}
                    </SummaryValue>
                </SummaryCard>
            </SummaryGrid>

            <FiltersCard>
                <FiltersRow>
                    {isAdmin ? (
                        <Select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            disabled={metaLoading}
                        >
                            <option value="">Все регионы</option>
                            {meta?.regions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </Select>
                    ) : null}

                    <Select
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(e.target.value)}
                        disabled={metaLoading}
                    >
                        {meta?.quarters.map((item) => (
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

                {metaLoading ? <LoadingText>Загрузка фильтров...</LoadingText> : null}
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
                        {dateColumns.length ? (
                            dateColumns.map((date) => (
                                <HeadCell key={date}>{formatDateLabel(date)}</HeadCell>
                            ))
                        ) : (
                            <HeadCell>Нет данных</HeadCell>
                        )}
                    </tr>
                    </thead>

                    <tbody>
                    {items.length ? (
                        items.map((item, index) => (
                            <Row
                                key={`${item.inn}-${index}`}
                                item={item}
                                index={index}
                                dateColumns={dateColumns}
                                onOpen={handleOpenDetails}
                            />
                        ))
                    ) : (
                        <tr>
                            <Cell colSpan={6 + Math.max(dateColumns.length, 1)}>
                                {pageFetching ? 'Загрузка данных...' : 'Данные не найдены'}
                            </Cell>
                        </tr>
                    )}
                    </tbody>
                </Table>

                <BottomLoader ref={sentinelRef}>
                    {pageFetching
                        ? 'Подгрузка ещё...'
                        : pageData?.hasMore
                            ? 'Прокрутите ниже для загрузки'
                            : items.length
                                ? 'Все записи загружены'
                                : ''}
                </BottomLoader>
            </TableWrap>

            {selectedInn ? (
                <>
                    <CommissionDetailsDrawer
                        open={Boolean(selectedInn)}
                        loading={detailsLoading}
                        saving={detailsSaving}
                        error={detailsError}
                        details={details}
                        selectedProtocolFiles={selectedProtocolFiles}
                        onClose={() => {
                            setSelectedInn(null);
                            setDetails(null);
                            setDetailsError('');
                            setSelectedProtocolFiles([]);
                        }}
                        onSave={handleSaveDetails}
                        onChange={(updater) => {
                            setDetails((prev) => (prev ? updater(prev) : prev));
                        }}
                        onPickFiles={(files) => {
                            setSelectedProtocolFiles((prev) => [...prev, ...files]);
                        }}
                        onRemoveSelectedFile={(index) => {
                            setSelectedProtocolFiles((prev) => prev.filter((_, i) => i !== index));
                        }}
                        onDownloadFile={handleDownloadProtocol}
                        onDeleteUploadedFile={handleDeleteProtocol}
                    />
                </>
            ) : null}
        </PageWrap>
    );
}