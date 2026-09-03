import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { appConstants } from '../../constant/appConstants';
import { localStore } from '../localStore';
import { logout, setGlobalLoading } from './slices/authSlice';
import { showToast } from './slices/toastSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: appConstants.apiBaseURL,
  prepareHeaders: (headers) => {
    const token = localStore.getToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithInterceptor = async (args, api, extraOptions) => {
  api.dispatch(setGlobalLoading(true));
  
  let result = await baseQuery(args, api, extraOptions);
  
  api.dispatch(setGlobalLoading(false));

  if (result.error) {
    if (result.error.status === 401) {
      api.dispatch(logout());
      api.dispatch(showToast({ message: 'Session expired. Please log in again.', variant: 'error' }));
    } else {
      const errMsg = result.error.data?.message || result.error.error || 'An unexpected error occurred';
      api.dispatch(showToast({ message: errMsg, variant: 'error' }));
    }
  }

  return result;
};

export const apiSliceInterceptor = {
  baseQueryWithInterceptor,
};
