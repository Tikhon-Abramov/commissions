import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type CommissionsMetaOption = {
    value: string;
    label: string;
};

export type CommissionBalanceDto = {
    date: string;
    amount: number;
};

export type CommissionItemDto = {
    inn: string;
    name: string;
    region: string;
    kno: string;
    balances: CommissionBalanceDto[];
    commissionStatus: string;
    interactionStatus: string;
    protocolFileName: string;
};

export type CommissionsMetaResponse = {
    success: true;
    data: {
        regions: CommissionsMetaOption[];
        quarters: CommissionsMetaOption[];
        defaultQuarter: string;
        userRegion: string;
        isAdmin: boolean;
    };
};

export type CommissionsSummaryResponse = {
    success: true;
    data: {
        taxpayersCount: number;
        ensDebt: number;
        commissionsDone: number;
        employeeDebtorsCount: number;
        employeeDebtAmount: number;
    };
};

export type CommissionsPageResponse = {
    success: true;
    data: {
        items: CommissionItemDto[];
        dates: string[];
        nextCursor: string | null;
        hasMore: boolean;
    };
};

type PageArgs = {
    quarter: string;
    region: string;
    search: string;
    status: string;
    cursor?: string | null;
    limit?: number;
};

export const commissionsApi = createApi({
    reducerPath: 'commissionsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:4000/api',
        credentials: 'include',
    }),
    tagTypes: ['CommissionsMeta', 'CommissionsSummary', 'CommissionsPage'],
    endpoints: (builder) => ({
        getCommissionsMeta: builder.query<CommissionsMetaResponse['data'], void>({
            query: () => '/commissions/meta',
            transformResponse: (response: CommissionsMetaResponse) => response.data,
            keepUnusedDataFor: 3600,
            providesTags: ['CommissionsMeta'],
        }),

        getCommissionsSummary: builder.query<
            CommissionsSummaryResponse['data'],
            { quarter: string; region: string }
        >({
            query: ({ quarter, region }) => ({
                url: '/commissions/summary',
                params: { quarter, region },
            }),
            transformResponse: (response: CommissionsSummaryResponse) => response.data,
            keepUnusedDataFor: 60,
            providesTags: (_result, _error, arg) => [
                { type: 'CommissionsSummary', id: `${arg.quarter}:${arg.region || 'all'}` },
            ],
        }),

        getCommissionsPage: builder.query<CommissionsPageResponse['data'], PageArgs>({
            query: ({ quarter, region, search, status, cursor, limit = 50 }) => ({
                url: '/commissions',
                params: {
                    quarter,
                    region,
                    search,
                    status,
                    cursor: cursor || '',
                    limit,
                },
            }),
            transformResponse: (response: CommissionsPageResponse) => response.data,
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const { quarter, region, search, status } = queryArgs;
                return `${endpointName}:${quarter}:${region}:${search}:${status}`;
            },
            merge: (currentCache, newData) => {
                const seen = new Set(currentCache.items.map((item) => item.inn));
                const merged = [...currentCache.items];

                for (const item of newData.items) {
                    if (!seen.has(item.inn)) {
                        merged.push(item);
                        seen.add(item.inn);
                    }
                }

                currentCache.items = merged;
                currentCache.nextCursor = newData.nextCursor;
                currentCache.hasMore = newData.hasMore;
            },
            forceRefetch({ currentArg, previousArg }) {
                return (
                    currentArg?.quarter !== previousArg?.quarter ||
                    currentArg?.region !== previousArg?.region ||
                    currentArg?.search !== previousArg?.search ||
                    currentArg?.status !== previousArg?.status ||
                    currentArg?.cursor !== previousArg?.cursor
                );
            },
            keepUnusedDataFor: 30,
            providesTags: ['CommissionsPage'],
        }),
    }),
});

export const {
    useGetCommissionsMetaQuery,
    useGetCommissionsSummaryQuery,
    useGetCommissionsPageQuery,
} = commissionsApi;