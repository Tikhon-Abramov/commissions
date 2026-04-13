import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import themeReducer from '../features/theme/themeSlice';
import commissionsReducer from '../features/commissions/commissionsSlice';
import moReducer from '../features/mo/moSlice';
import ratingReducer from '../features/rating/ratingSlice';
import secondLevelDebtReducer from '../features/secondLevelDebt/secondLevelDebtSlice';
import feedbackReducer from '../features/feedback/feedbackSlice';
import adminReducer from '../features/admin/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    commissions: commissionsReducer,
    mo: moReducer,
    rating: ratingReducer,
    secondLevelDebt: secondLevelDebtReducer,
    feedback: feedbackReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;