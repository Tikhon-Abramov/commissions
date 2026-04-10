import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DebtCard, DebtMoItem, DebtTaxpayerItem } from '../../types/secondLevelDebt';

type SecondLevelDebtFilters = {
    region: string;
    date: string;
    search: string;
    budgetType: 'all' | 'budget' | 'non-budget';
    taxpayerType: 'all' | 'all-taxpayers';
};

type SecondLevelDebtState = {
    moList: DebtMoItem[];
    taxpayerList: DebtTaxpayerItem[];
    filters: SecondLevelDebtFilters;
    selectedMoOktmo: string | null;
    selectedCard: DebtCard | null;
    isCardOpen: boolean;
};

const initialState: SecondLevelDebtState = {
    moList: [],
    taxpayerList: [],
    filters: {
        region: '',
        date: '',
        search: '',
        budgetType: 'all',
        taxpayerType: 'all',
    },
    selectedMoOktmo: null,
    selectedCard: null,
    isCardOpen: false,
};

const secondLevelDebtSlice = createSlice({
    name: 'secondLevelDebt',
    initialState,
    reducers: {
        setSecondLevelDebtData(
            state,
            action: PayloadAction<{ moList: DebtMoItem[]; taxpayerList: DebtTaxpayerItem[] }>,
        ) {
            state.moList = action.payload.moList;
            state.taxpayerList = action.payload.taxpayerList;
        },
        setSecondLevelDebtFilters(state, action: PayloadAction<Partial<SecondLevelDebtFilters>>) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setSelectedMo(state, action: PayloadAction<string | null>) {
            state.selectedMoOktmo = action.payload;
        },
        openDebtCard(state, action: PayloadAction<DebtCard>) {
            state.selectedCard = action.payload;
            state.isCardOpen = true;
        },
        closeDebtCard(state) {
            state.selectedCard = null;
            state.isCardOpen = false;
        },
    },
});

export const {
    setSecondLevelDebtData,
    setSecondLevelDebtFilters,
    setSelectedMo,
    openDebtCard,
    closeDebtCard,
} = secondLevelDebtSlice.actions;

export default secondLevelDebtSlice.reducer;