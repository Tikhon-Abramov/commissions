import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LoadingState, SummaryMetric } from '../../types/common';
import type { CommissionCompanyCard, CommissionEditForm, CommissionItem } from '../../types/commission';

interface CommissionsState {
  loading: LoadingState;
  list: CommissionItem[];
  summary: SummaryMetric[];
  selectedCard: CommissionCompanyCard | null;
  isCardOpen: boolean;
  currentForm: CommissionEditForm;
  filters: {
    region: string;
    quarter: string;
    search: string;
    status: string;
  };
}

const emptyForm: CommissionEditForm = {
  commissionStatus: '',
  interactionStatus: '',
  commissionDate: '',
  measures: false,
  note: '',
  protocolFileName: '',
};

const initialState: CommissionsState = {
  loading: 'idle',
  list: [],
  summary: [],
  selectedCard: null,
  isCardOpen: false,
  currentForm: emptyForm,
  filters: {
    region: '',
    quarter: '',
    search: '',
    status: '',
  },
};

const commissionsSlice = createSlice({
  name: 'commissions',
  initialState,
  reducers: {
    setCommissionsLoading(state, action: PayloadAction<LoadingState>) {
      state.loading = action.payload;
    },
    setCommissionsList(state, action: PayloadAction<CommissionItem[]>) {
      state.list = action.payload;
    },
    setCommissionsSummary(state, action: PayloadAction<SummaryMetric[]>) {
      state.summary = action.payload;
    },
    openCommissionCard(state, action: PayloadAction<{ card: CommissionCompanyCard; form: CommissionEditForm }>) {
      state.selectedCard = action.payload.card;
      state.currentForm = action.payload.form;
      state.isCardOpen = true;
    },
    closeCommissionCard(state) {
      state.isCardOpen = false;
      state.selectedCard = null;
    },
    setCommissionFilters(state, action: PayloadAction<Partial<CommissionsState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateCommissionForm(state, action: PayloadAction<Partial<CommissionEditForm>>) {
      state.currentForm = { ...state.currentForm, ...action.payload };
    },
    applyCommissionForm(state) {
      if (!state.selectedCard) {
        return;
      }

      const target = state.list.find((item) => item.inn === state.selectedCard?.inn);
      if (!target) {
        return;
      }

      target.commissionStatus = state.currentForm.commissionStatus;
      target.interactionStatus = state.currentForm.interactionStatus;
      target.commissionDate = state.currentForm.commissionDate;
      target.measures = state.currentForm.measures;
      target.protocolFileName = state.currentForm.protocolFileName;
    },
  },
});

export const {
  setCommissionsLoading,
  setCommissionsList,
  setCommissionsSummary,
  openCommissionCard,
  closeCommissionCard,
  setCommissionFilters,
  updateCommissionForm,
  applyCommissionForm,
} = commissionsSlice.actions;

export default commissionsSlice.reducer;
