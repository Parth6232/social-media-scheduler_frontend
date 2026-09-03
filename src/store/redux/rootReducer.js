import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import toastReducer from './slices/toastSlice';
import { authApiReducer, authApiAction } from '../../features/auth/authApiSlice';
import { accountsApiReducer, accountsApiAction } from '../../features/accounts/accountsApiSlice';
import { postApiReducer, postApiAction } from '../../features/createPost/postApiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  toast: toastReducer,
  [authApiAction.reducerPath]: authApiReducer,
  [accountsApiAction.reducerPath]: accountsApiReducer,
  [postApiAction.reducerPath]: postApiReducer,
});

export default rootReducer;
