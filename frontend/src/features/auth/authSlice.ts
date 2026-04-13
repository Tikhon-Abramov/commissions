import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthUserRole = 'admin' | 'user';

interface AuthState {
  userKey: string | null;
  username: string | null;
  fullName: string | null;
  isAdmin: boolean;
  role: AuthUserRole | null;
  region: string | null;
}

const initialState: AuthState = {
  userKey: localStorage.getItem('userKey'),
  username: localStorage.getItem('username'),
  fullName: localStorage.getItem('fullName'),
  isAdmin: localStorage.getItem('isAdmin') === 'true',
  role: (localStorage.getItem('role') as AuthUserRole | null) ?? null,
  region: localStorage.getItem('region'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
        state,
        action: PayloadAction<{
          userKey: string;
          username: string;
          fullName: string;
          isAdmin: boolean;
          role: AuthUserRole;
          region: string | null;
        }>,
    ) {
      state.userKey = action.payload.userKey;
      state.username = action.payload.username;
      state.fullName = action.payload.fullName;
      state.isAdmin = action.payload.isAdmin;
      state.role = action.payload.role;
      state.region = action.payload.region;

      localStorage.setItem('userKey', action.payload.userKey);
      localStorage.setItem('username', action.payload.username);
      localStorage.setItem('fullName', action.payload.fullName);
      localStorage.setItem('isAdmin', String(action.payload.isAdmin));
      localStorage.setItem('role', action.payload.role);
      localStorage.setItem('region', action.payload.region ?? '');
    },

    logout(state) {
      state.userKey = null;
      state.username = null;
      state.fullName = null;
      state.isAdmin = false;
      state.role = null;
      state.region = null;

      localStorage.removeItem('userKey');
      localStorage.removeItem('username');
      localStorage.removeItem('fullName');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('role');
      localStorage.removeItem('region');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;