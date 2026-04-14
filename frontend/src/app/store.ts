import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import themeReducer from '../features/theme/themeSlice';
import commissionsReducer from '../features/commissions/commissionsSlice';
import secondLevelDebtReducer from '../features/secondLevelDebt/secondLevelDebtSlice';
import ratingReducer from '../features/rating/ratingSlice';
import feedbackReducer from '../features/feedback/feedbackSlice';
import adminReducer from '../features/admin/adminSlice';
import { commissionsApi } from '../features/commissions/commissionsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    commissions: commissionsReducer,
    secondLevelDebt: secondLevelDebtReducer,
    rating: ratingReducer,
    feedback: feedbackReducer,
    admin: adminReducer,
    [commissionsApi.reducerPath]: commissionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(commissionsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;