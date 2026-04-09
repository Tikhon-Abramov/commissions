import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LoadingState, SummaryMetric } from '../../types/common';
import type { CompanyDebtRow, MoTableRow } from '../../types/mo';

interface MoState {
  loading: LoadingState;
  summary: SummaryMetric[];
  budgetSummary: SummaryMetric[];
  nonBudgetSummary: SummaryMetric[];
  municipalities: MoTableRow[];
  companies: CompanyDebtRow[];
  filters: {
    region: string;
    period: string;
    search: string;
    budgetMode: 'all' | 'budget' | 'non-budget';
  };
}

const initialState: MoState = {
  loading: 'idle',
  summary: [],
  budgetSummary: [],
  nonBudgetSummary: [],
  municipalities: [],
  companies: [],
  filters: {
    region: '',
    period: '',
    search: '',
    budgetMode: 'all',
  },
};

const moSlice = createSlice({
  name: 'mo',
  initialState,
  reducers: {
    setMoLoading(state, action: PayloadAction<LoadingState>) {
      state.loading = action.payload;
    },
    setMoSummary(state, action: PayloadAction<Pick<MoState, 'summary' | 'budgetSummary' | 'nonBudgetSummary'>>) {
      state.summary = action.payload.summary;
      state.budgetSummary = action.payload.budgetSummary;
      state.nonBudgetSummary = action.payload.nonBudgetSummary;
    },
    setMunicipalities(state, action: PayloadAction<MoTableRow[]>) {
      state.municipalities = action.payload;
    },
    setCompanies(state, action: PayloadAction<CompanyDebtRow[]>) {
      state.companies = action.payload;
    },
    setMoFilters(state, action: PayloadAction<Partial<MoState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setMoLoading, setMoSummary, setMunicipalities, setCompanies, setMoFilters } = moSlice.actions;
export default moSlice.reducer;
