import type { CommissionItem } from '../types/commission';

type ExportParams = {
    items: CommissionItem[];
    quarter: string;
    regionCode?: string;
    isAdmin: boolean;
    userRegion?: string | null;
};

const getQuarterCode = (date: string) => {
    const parsed = new Date(date);
    const month = parsed.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    return `${parsed.getFullYear()}-Q${quarter}`;
};

const formatDate = (value: string) => {
    const [year, month, day] = value.split('-');
    return `${day}.${month}.${year}`;
};

const escapeCsv = (value: unknown) => {
    const stringValue = String(value ?? '');
    if (/[",;\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

const getExportRegion = ({
                             isAdmin,
                             regionCode,
                             userRegion,
                         }: Pick<ExportParams, 'isAdmin' | 'regionCode' | 'userRegion'>) => {
    if (!isAdmin) {
        return userRegion ?? '';
    }

    return regionCode ?? '';
};

const buildFileName = (quarter: string, regionCode?: string) => {
    const suffix = regionCode ? `region-${regionCode}` : 'all-regions';
    return `commissions-stat-${suffix}-${quarter}.csv`;
};

export const exportCommissionsStats = ({
                                           items,
                                           quarter,
                                           regionCode,
                                           isAdmin,
                                           userRegion,
                                       }: ExportParams) => {
    const exportRegion = getExportRegion({ isAdmin, regionCode, userRegion });

    const regionFiltered = items.filter((item) => {
        if (!exportRegion) return true;
        return item.region === exportRegion;
    });

    const quarterFiltered = regionFiltered.filter((item) =>
        item.balances.some((balance) => getQuarterCode(balance.date) === quarter),
    );

    const allQuarterDates = Array.from(
        new Set(
            quarterFiltered.flatMap((item) =>
                item.balances
                    .filter((balance) => getQuarterCode(balance.date) === quarter)
                    .map((balance) => balance.date),
            ),
        ),
    ).sort((a, b) => a.localeCompare(b));

    const headers = [
        'ИНН',
        'Наименование',
        'Регион',
        'КНО',
        ...allQuarterDates.map((date) => `Совокупная задолженность на ${formatDate(date)}`),
        'Проведение комиссии',
        'Результат взаимодействия',
        'Протокол',
    ];

    const rows = quarterFiltered.map((item) => {
        const balancesMap = new Map(item.balances.map((balance) => [balance.date, balance.amount]));

        return [
            item.inn,
            item.name,
            item.region,
            item.kno,
            ...allQuarterDates.map((date) => balancesMap.get(date) ?? ''),
            item.commissionStatus ?? '',
            item.interactionStatus ?? '',
            item.protocolFileName ? 'Прикреплен' : 'Нет',
        ];
    });

    const metaRows = [
        ['Отчет', 'Комиссии'],
        ['Квартал', quarter],
        ['Регион', exportRegion || 'Все регионы'],
        ['Дата формирования', new Date().toLocaleString('ru-RU')],
        [],
    ];

    const csvContent = [...metaRows, headers, ...rows]
        .map((row) => row.map((cell) => escapeCsv(cell)).join(';'))
        .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], {
        type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildFileName(quarter, exportRegion || undefined);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};