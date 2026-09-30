import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import toastReducer from './slices/toastSlice';
import uiReducer from './slices/uiSlice';
import { authApiReducer, authApiAction } from '../../features/auth/authApiSlice';
import { accountsApiReducer, accountsApiAction } from '../../features/accounts/accountsApiSlice';
import { postApiReducer, postApiAction } from '../../features/createPost/postApiSlice';
import { aiApiReducer, aiApiAction } from '../../features/ai/aiApiSlice';
import { mediaApiReducer, mediaApiAction } from '../../features/media/mediaApiSlice';
// NEW: Analytics
import { analyticsApiReducer, analyticsApiAction } from '../../features/analytics/analyticsApiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  toast: toastReducer,
  [authApiAction.reducerPath]: authApiReducer,
  [accountsApiAction.reducerPath]: accountsApiReducer,
  [postApiAction.reducerPath]: postApiReducer,
  [aiApiAction.reducerPath]: aiApiReducer,
  [mediaApiAction.reducerPath]: mediaApiReducer,
  [analyticsApiAction.reducerPath]: analyticsApiReducer,
});

export default rootReducer;