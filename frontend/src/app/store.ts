import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import commissionsReducer from '../features/commissions/commissionsSlice';
import moReducer from '../features/mo/moSlice';
import ratingReducer from '../features/rating/ratingSlice';
import themeReducer from '../features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    commissions: commissionsReducer,
    mo: moReducer,
    rating: ratingReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
