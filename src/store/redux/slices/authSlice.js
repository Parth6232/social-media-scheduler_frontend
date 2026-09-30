import { createSlice } from '@reduxjs/toolkit';
import { localStore } from '../../localStore';

const initialState = {
  isAuthenticated: !!localStore.getToken(),
  user: null,
  isLoading: false, // Global loading state for API calls
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      if (token) {
        localStore.setToken(token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStore.removeToken();
    },
    setGlobalLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('persist/REHYDRATE', (state, action) => {
      // Never allow a stuck global loading state to survive page reload
      state.isLoading = false;
      if (action.payload?.auth) {
        state.isAuthenticated = !!action.payload.auth.isAuthenticated && !!localStore.getToken();
        state.user = action.payload.auth.user || null;
      }
    });
  },
});

export const { setCredentials, logout, setGlobalLoading } = authSlice.actions;
export default authSlice.reducer;
