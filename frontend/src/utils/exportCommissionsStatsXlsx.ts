import * as XLSX from 'xlsx';
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

const formatAmount = (value?: number | null) => {
    if (value === null || value === undefined) return '';
    return value;
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
    return `commissions-stat-${suffix}-${quarter}.xlsx`;
};

export const exportCommissionsStatsXlsx = ({
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

    const sheetRows: Array<Record<string, string | number>> = quarterFiltered.map((item, index) => {
        const row: Record<string, string | number> = {
            '№': index + 1,
            'ИНН': item.inn,
            'Наименование': item.name,
            'KNO': item.kno,
        };

        allQuarterDates.forEach((date) => {
            const balance = item.balances.find((entry) => entry.date === date);
            row[`Совокупная задолженность на ${formatDate(date)}`] = formatAmount(balance?.amount) || '';
        });

        row['Проведение комиссии'] = item.commissionStatus ?? '';
        row['Результат взаимодействия с НП'] = item.interactionStatus ?? '';
        row['Протокол'] = item.protocolFileName ? 'Прикреплен' : '';

        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(sheetRows, { skipHeader: false });

    const headerKeys = Object.keys(sheetRows[0] ?? {
        '№': '',
        'ИНН': '',
        'Наименование': '',
        'KNO': '',
        'Проведение комиссии': '',
        'Результат взаимодействия с НП': '',
        'Протокол': '',
    });

    const metaRows = [
        ['Отчет', 'Комиссии'],
        ['Квартал', quarter],
        ['Регион', exportRegion || 'Все регионы'],
        ['Дата формирования', new Date().toLocaleString('ru-RU')],
        [],
    ];

    XLSX.utils.sheet_add_aoa(worksheet, metaRows, { origin: 'A1' });
    XLSX.utils.sheet_add_json(worksheet, sheetRows, {
        origin: 'A6',
        skipHeader: false,
    });

    const dateColumnsCount = allQuarterDates.length;
    const columns = [
        { wch: 6 },
        { wch: 16 },
        { wch: 36 },
        { wch: 16 },
        ...Array.from({ length: dateColumnsCount }, () => ({ wch: 20 })),
        { wch: 24 },
        { wch: 28 },
        { wch: 14 },
    ];

    worksheet['!cols'] = columns;

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let row = 0; row <= range.e.r; row += 1) {
        for (let col = 0; col <= range.e.c; col += 1) {
            const address = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = worksheet[address];
            if (!cell) continue;

            if (row >= 6 && col >= 4 && col < 4 + dateColumnsCount && typeof cell.v === 'number') {
                cell.t = 'n';
                cell.z = '#,##0';
            }
        }
    }

    worksheet['!autofilter'] = {
        ref: XLSX.utils.encode_range({
            s: { r: 5, c: 0 },
            e: { r: 5 + sheetRows.length, c: headerKeys.length - 1 },
        }),
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Комиссии');

    XLSX.writeFile(workbook, buildFileName(quarter, exportRegion || undefined));
};