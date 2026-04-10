import * as XLSX from 'xlsx';
import type { DebtEmployeeItem, DebtMoItem, DebtTaxpayerItem } from '../types/secondLevelDebt';

const formatDate = (value: string) => {
    const [year, month, day] = value.split('-');
    return `${day}.${month}.${year}`;
};

const saveWorkbook = (sheetName: string, rows: Array<Record<string, string | number>>, filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 22 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
};

export const exportMoStatisticsXlsx = (mo: DebtMoItem, taxpayers: DebtTaxpayerItem[]) => {
    const employees = taxpayers.reduce((acc, item) => acc + item.employeesCount, 0);
    const debtors = taxpayers.reduce((acc, item) => acc + item.debtorsCount, 0);
    const debtAmount = taxpayers.reduce((acc, item) => acc + item.debtAmount, 0);

    saveWorkbook(
        'Статистика МО',
        [
            {
                'Дата': formatDate(mo.date),
                'ОКТМО': mo.oktmo,
                'Наименование МО': mo.moName,
                'Общее кол-во предприятий': mo.enterprisesCount,
                'Количество сотрудников': employees || mo.employeesCount,
                'Количество должников': debtors || mo.debtorsCount,
                'Доля должников': employees ? `${((debtors / employees) * 100).toFixed(1).replace('.', ',')} %` : '0 %',
                'Общая сумма задолженности по сотрудникам': debtAmount || mo.debtAmount,
                'Рейтинг': mo.rating,
            },
        ],
        `mo-stat-${mo.oktmo}-${mo.date}.xlsx`,
    );
};

export const exportMoDetailsXlsx = (mo: DebtMoItem, taxpayers: DebtTaxpayerItem[]) => {
    saveWorkbook(
        'Детализация МО',
        taxpayers.map((item, index) => ({
            '№': index + 1,
            'Дата': formatDate(item.date),
            'ОКТМО': item.oktmo,
            'Наименование МО': item.moName,
            'ИНН': item.inn,
            'Наименование': item.name,
            'Общая сумма задолженности по сотрудникам': item.debtAmount,
            'Количество сотрудников': item.employeesCount,
            'Количество должников': item.debtorsCount,
            'Доля должников': item.employeesCount
                ? `${((item.debtorsCount / item.employeesCount) * 100).toFixed(1).replace('.', ',')} %`
                : '0 %',
            'БО': item.isBudgetOrganization ? 'Да' : 'Нет',
            'ФССП': item.hasFssp ? 'Да' : 'Нет',
        })),
        `mo-details-${mo.oktmo}-${mo.date}.xlsx`,
    );
};

export const exportTaxpayerEmployeesXlsx = (
    taxpayer: DebtTaxpayerItem,
    employees: DebtEmployeeItem[],
) => {
    saveWorkbook(
        'Сотрудники',
        employees.map((employee, index) => ({
            '№': index + 1,
            'ИНН организации': taxpayer.inn,
            'Наименование организации': taxpayer.name,
            'ФИО сотрудника': employee.fio,
            'ИНН сотрудника': employee.inn ?? '',
            'Сумма задолженности': employee.debtAmount,
        })),
        `taxpayer-employees-${taxpayer.inn}-${taxpayer.date}.xlsx`,
    );
};