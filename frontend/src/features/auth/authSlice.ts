import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  userKey: string | null;
  username: string | null;
  isAdmin: boolean;
  region: string | null;
}

const initialState: AuthState = {
  userKey: localStorage.getItem('userKey'),
  username: null,
  isAdmin: false,
  region: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthState>) {
      state.userKey = action.payload.userKey;
      state.username = action.payload.username;
      state.isAdmin = action.payload.isAdmin;
      state.region = action.payload.region;
      if (action.payload.userKey) {
        localStorage.setItem('userKey', action.payload.userKey);
      }
    },
    logout(state) {
      state.userKey = null;
      state.username = null;
      state.isAdmin = false;
      state.region = null;
      localStorage.removeItem('userKey');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
