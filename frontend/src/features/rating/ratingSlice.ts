import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LoadingState } from '../../types/common';
import type {
  RatingMoRow,
  RatingRegionRow,
  RatingSummaryMetric,
  RatingTopDebtorRow,
  RatingTopDebtorSecondLevelRow,
  RatingTopMoRow,
} from '../../types/rating';

type RatingFilters = {
  region: string;
  period: string;
};

type RatingState = {
  loading: LoadingState;
  summary: RatingSummaryMetric[];
  regionRows: RatingRegionRow[];
  moRows: RatingMoRow[];
  topBestMoRows: RatingTopMoRow[];
  topWorstMoRows: RatingTopMoRow[];
  topDebtorsRows: RatingTopDebtorRow[];
  topBudgetDebtorsRows: RatingTopDebtorRow[];
  topSecondLevelDebtorsRows: RatingTopDebtorSecondLevelRow[];
  filters: RatingFilters;
};

const initialState: RatingState = {
  loading: 'idle',
  summary: [],
  regionRows: [],
  moRows: [],
  topBestMoRows: [],
  topWorstMoRows: [],
  topDebtorsRows: [],
  topBudgetDebtorsRows: [],
  topSecondLevelDebtorsRows: [],
  filters: {
    region: '',
    period: '2026-Q1',
  },
};

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    setRatingLoading(state, action: PayloadAction<LoadingState>) {
      state.loading = action.payload;
    },
    setRatingSummary(state, action: PayloadAction<RatingSummaryMetric[]>) {
      state.summary = action.payload;
    },
    setRatingRegionRows(state, action: PayloadAction<RatingRegionRow[]>) {
      state.regionRows = action.payload;
    },
    setRatingMoRows(state, action: PayloadAction<RatingMoRow[]>) {
      state.moRows = action.payload;
    },
    setRatingTopBestMoRows(state, action: PayloadAction<RatingTopMoRow[]>) {
      state.topBestMoRows = action.payload;
    },
    setRatingTopWorstMoRows(state, action: PayloadAction<RatingTopMoRow[]>) {
      state.topWorstMoRows = action.payload;
    },
    setTopDebtorsRows(state, action: PayloadAction<RatingTopDebtorRow[]>) {
      state.topDebtorsRows = action.payload;
    },
    setTopBudgetDebtorsRows(state, action: PayloadAction<RatingTopDebtorRow[]>) {
      state.topBudgetDebtorsRows = action.payload;
    },
    setTopSecondLevelDebtorsRows(state, action: PayloadAction<RatingTopDebtorSecondLevelRow[]>) {
      state.topSecondLevelDebtorsRows = action.payload;
    },
    setRatingFilters(state, action: PayloadAction<Partial<RatingFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
  },
});

export const {
  setRatingLoading,
  setRatingSummary,
  setRatingRegionRows,
  setRatingMoRows,
  setRatingTopBestMoRows,
  setRatingTopWorstMoRows,
  setTopDebtorsRows,
  setTopBudgetDebtorsRows,
  setTopSecondLevelDebtorsRows,
  setRatingFilters,
} = ratingSlice.actions;

export default ratingSlice.reducer;