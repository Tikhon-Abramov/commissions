import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { PageHeader } from '../components/common/PageHeader';

type ExportRow = {
    id: string;
    title: string;
    fileName: string;
    action: 'commissions' | 'mo' | 'regions' | 'oktmo' | 'top' | 'combined';
};

const EXPORT_ROWS: ExportRow[] = [
    {
        id: 'commissions',
        title: 'Статистика комиссий',
        fileName: 'Статистика комиссий.xlsx',
        action: 'commissions',
    },
    {
        id: 'mo',
        title: 'Статистика МО',
        fileName: 'Статистика МО.xlsx',
        action: 'mo',
    },
    {
        id: 'regions',
        title: 'Долг второго уровня. Сводная по всем регионам.',
        fileName: 'Долг второго уровня. Сводная по всем регионам.xlsx',
        action: 'regions',
    },
    {
        id: 'oktmo',
        title: 'Долг второго уровня. Сводная по всем ОКТМО.',
        fileName: 'Долг второго уровня. Сводная по всем ОКТМО.xlsx',
        action: 'oktmo',
    },
    {
        id: 'top',
        title: 'Долг второго уровня. Топ-5.',
        fileName: 'Долг второго уровня. Топ-5.xlsx',
        action: 'top',
    },
    {
        id: 'combined',
        title: 'Сборная статистика комиссий',
        fileName: 'Сборная статистика комиссий.xlsx',
        action: 'combined',
    },
];

const PERIODS = [
    { value: '2026-q1', label: '1 квартал 2026 года' },
    { value: '2025-q4', label: '4 квартал 2025 года' },
    { value: '2025-q3', label: '3 квартал 2025 года' },
];

const DATES_BY_PERIOD: Record<string, Array<{ value: string; label: string }>> = {
    '2026-q1': [
        { value: '2026-01-15', label: '15.01.2026' },
        { value: '2026-02-15', label: '15.02.2026' },
        { value: '2026-03-15', label: '15.03.2026' },
    ],
    '2025-q4': [
        { value: '2025-10-15', label: '15.10.2025' },
        { value: '2025-11-15', label: '15.11.2025' },
        { value: '2025-12-15', label: '15.12.2025' },
    ],
    '2025-q3': [
        { value: '2025-07-15', label: '15.07.2025' },
        { value: '2025-08-15', label: '15.08.2025' },
        { value: '2025-09-15', label: '15.09.2025' },
    ],
};

const PageWrap = styled.div`
  display: grid;
  gap: 18px;
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
`;

const Table = styled.table`
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
`;

const HeadCell = styled.th`
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Cell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
`;

const DownloadArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const DownloadButton = styled.button`
  height: 44px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

const Select = styled.select`
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Note = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;

function triggerMockDownload(fileName: string) {
    const blob = new Blob([`Файл выгрузки: ${fileName}`], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function RegionStatsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0].value);

    const dates = useMemo(() => {
        return DATES_BY_PERIOD[selectedPeriod] ?? [];
    }, [selectedPeriod]);

    const [selectedDate, setSelectedDate] = useState(DATES_BY_PERIOD[PERIODS[0].value][0].value);

    return (
        <PageWrap>
            <PageHeader
                title="Статистика регионов"
                description="Страница выгрузок для администратора."
            />

            <Note>
                Структура повторяет старую страницу: таблица документов и ссылки на скачивание.
            </Note>

            <TableWrap>
                <Table>
                    <thead>
                    <tr>
                        <HeadCell style={{ width: '36%' }}>Документ</HeadCell>
                        <HeadCell style={{ width: '64%' }}>Ссылка на скачивание</HeadCell>
                    </tr>
                    </thead>

                    <tbody>
                    {EXPORT_ROWS.map((row) => (
                        <tr key={row.id}>
                            <Cell>{row.title}</Cell>
                            <Cell>
                                <DownloadArea>
                                    <DownloadButton
                                        type="button"
                                        onClick={() => triggerMockDownload(row.fileName)}
                                    >
                                        <span>📊</span>
                                        <span>{row.fileName}</span>
                                    </DownloadButton>

                                    {row.action === 'combined' ? (
                                        <>
                                            <Select
                                                value={selectedPeriod}
                                                onChange={(e) => {
                                                    const nextPeriod = e.target.value;
                                                    setSelectedPeriod(nextPeriod);
                                                    const nextDates = DATES_BY_PERIOD[nextPeriod] ?? [];
                                                    if (nextDates.length) {
                                                        setSelectedDate(nextDates[0].value);
                                                    }
                                                }}
                                            >
                                                {PERIODS.map((period) => (
                                                    <option key={period.value} value={period.value}>
                                                        {period.label}
                                                    </option>
                                                ))}
                                            </Select>

                                            <Select
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                            >
                                                {dates.map((date) => (
                                                    <option key={date.value} value={date.value}>
                                                        {date.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </>
                                    ) : null}
                                </DownloadArea>
                            </Cell>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </TableWrap>
        </PageWrap>
    );
}