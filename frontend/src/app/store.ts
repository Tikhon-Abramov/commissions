import { configureStore } from '@reduxjs/toolkit';
import commissionsReducer from '../features/commissions/commissionsSlice';
import secondLevelDebtReducer from '../features/secondLevelDebt/secondLevelDebtSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    commissions: commissionsReducer,
    secondLevelDebt: secondLevelDebtReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;