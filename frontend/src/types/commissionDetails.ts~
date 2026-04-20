export type CommissionDetailsResponse = {
    success: true;
    data: {
        inn: string;
        name: string;
        region: string;
        kno: string;
        oktmo: string;
        employeesWithDebt: string | number | null;
        realEstateCount: string | number | null;
        landCount: string | number | null;
        transportCount: string | number | null;
        address: string | null;
        okved: string | null;
        revenue: {
            '2024': string | number | null;
            '2023': string | number | null;
            '2022': string | number | null;
            '2021': string | number | null;
        };
        avgHeadcount: {
            '2024': string | number | null;
            '2023': string | number | null;
            '2022': string | number | null;
            '2021': string | number | null;
        };
        currentSaldoEns: string | number | null;
        currentRegionDebt: string | number | null;
        previousPeriods: Array<{
            periodLabel: string;
            saldoEns: string | number | null;
            regionDebt: string | number | null;
        }>;
        enforcement: {
            demandExists: string | null;
            decision46Exists: string | null;
            post47Count: string | number | null;
            post47DebtRest: string | number | null;
            zvsp48Count: string | number | null;
            zvspDebtRest: string | number | null;
        };
        commission: {
            id: number | null;
            comEvents: string;
            comDate: string;
            impactMeasures?: string;
            ogvOmsuParticipation?: string;
            note?: string;
        };
        event: {
            id: number | null;
            events: string;
            actionDate: string;
        };
        file: {
            id: number | null;
            originalFilename: string;
            uploadedAt: string;
        };
        balances: Array<{
            date: string;
            saldo: number | null;
            knsum: number | null;
        }>;
        changesHistory: Array<{
            changedAt: string;
            text: string;
        }>;
    };
};