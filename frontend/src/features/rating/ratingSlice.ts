import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LoadingState, SummaryMetric } from '../../types/common';
import type { RatingIndicator, RatingTopRow } from '../../types/rating';

interface RatingState {
  loading: LoadingState;
  summary: SummaryMetric[];
  indicators: RatingIndicator[];
  topBest: RatingTopRow[];
  topWorst: RatingTopRow[];
  filters: {
    region: string;
    period: string;
  };
}

const initialState: RatingState = {
  loading: 'idle',
  summary: [],
  indicators: [],
  topBest: [],
  topWorst: [],
  filters: {
    region: '',
    period: '',
  },
};

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    setRatingLoading(state, action: PayloadAction<LoadingState>) {
      state.loading = action.payload;
    },
    setRatingSummary(state, action: PayloadAction<SummaryMetric[]>) {
      state.summary = action.payload;
    },
    setRatingIndicators(state, action: PayloadAction<RatingIndicator[]>) {
      state.indicators = action.payload;
    },
    setRatingTops(state, action: PayloadAction<{ topBest: RatingTopRow[]; topWorst: RatingTopRow[] }>) {
      state.topBest = action.payload.topBest;
      state.topWorst = action.payload.topWorst;
    },
    setRatingFilters(state, action: PayloadAction<Partial<RatingState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setRatingLoading, setRatingSummary, setRatingIndicators, setRatingTops, setRatingFilters } = ratingSlice.actions;
export default ratingSlice.reducer;
