import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CommissionCard, CommissionForm, CommissionItem, CommissionSummaryItem } from '../../types/commission';

const getCurrentQuarter = () => {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${quarter}`;
};

type CommissionFilters = {
  region: string;
  quarter: string;
  status: string;
  search: string;
};

type CommissionState = {
  list: CommissionItem[];
  summary: CommissionSummaryItem[];
  filters: CommissionFilters;
  selectedCard: CommissionCard | null;
  currentForm: CommissionForm | null;
  isCardOpen: boolean;
};

const initialState: CommissionState = {
  list: [],
  summary: [],
  filters: {
    region: '',
    quarter: getCurrentQuarter(),
    status: '',
    search: '',
  },
  selectedCard: null,
  currentForm: null,
  isCardOpen: false,
};

const commissionsSlice = createSlice({
  name: 'commissions',
  initialState,
  reducers: {
    setCommissionsList(state, action: PayloadAction<CommissionItem[]>) {
      state.list = action.payload;
    },
    setCommissionsSummary(state, action: PayloadAction<CommissionSummaryItem[]>) {
      state.summary = action.payload;
    },
    setCommissionFilters(state, action: PayloadAction<Partial<CommissionFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    openCommissionCard(
        state,
        action: PayloadAction<{ card: CommissionCard; form: CommissionForm }>,
    ) {
      state.selectedCard = action.payload.card;
      state.currentForm = action.payload.form;
      state.isCardOpen = true;
    },
    closeCommissionCard(state) {
      state.isCardOpen = false;
      state.selectedCard = null;
      state.currentForm = null;
    },
    updateCommissionForm(state, action: PayloadAction<Partial<CommissionForm>>) {
      if (!state.currentForm) return;
      state.currentForm = {
        ...state.currentForm,
        ...action.payload,
      };
    },
    applyCommissionForm(state) {
      if (!state.selectedCard || !state.currentForm) return;

      state.list = state.list.map((item) =>
          item.inn === state.selectedCard?.inn
              ? {
                ...item,
                commissionStatus: state.currentForm?.commissionStatus,
                interactionStatus: state.currentForm?.interactionStatus,
                protocolFileName: state.currentForm?.protocolFileName,
              }
              : item,
      );

      state.selectedCard = {
        ...state.selectedCard,
        history: [
          {
            date: new Date().toISOString().slice(0, 10),
            action: 'Изменения по комиссии сохранены',
            author: 'Текущий пользователь',
          },
          ...state.selectedCard.history,
        ],
      };
    },
  },
});

export const {
  setCommissionsList,
  setCommissionsSummary,
  setCommissionFilters,
  openCommissionCard,
  closeCommissionCard,
  updateCommissionForm,
  applyCommissionForm,
} = commissionsSlice.actions;

export default commissionsSlice.reducer;