import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    themeMode: 'dark',   // default dark — existing UI na tute
    language: 'en',
  },
  reducers: {
    setThemeMode: (state, action) => {
      state.themeMode = action.payload; // 'light' | 'dark'
    },
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
    },
    setLanguage: (state, action) => {
      state.language = action.payload; // 'en' | 'hi' | 'hinglish'
    },
  },
});

export const { setThemeMode, toggleThemeMode, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;
