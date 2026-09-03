import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import rootReducer from './redux/rootReducer';
import { authApiAction } from '../features/auth/authApiSlice';
import { accountsApiAction } from '../features/accounts/accountsApiSlice';
import { postApiAction } from '../features/createPost/postApiSlice';

// Custom storage wrapper for Vite / redux-persist compatibility
const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, item) => Promise.resolve(localStorage.setItem(key, item)),
  removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};

const persistConfig = {
  key: 'socialblitz_root',
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    })
    .concat(authApiAction.middleware)
    .concat(accountsApiAction.middleware)
    .concat(postApiAction.middleware),
});

export const persistor = persistStore(store);
