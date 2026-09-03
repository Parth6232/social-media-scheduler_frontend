import { createApi } from '@reduxjs/toolkit/query/react';
import { apiSliceInterceptor } from '../../store/redux/apiSliceInterceptor';

const accountsApi = createApi({
  reducerPath: 'accountsApi',
  baseQuery: apiSliceInterceptor.baseQueryWithInterceptor,
  tagTypes: ['ACCOUNTS'],
  endpoints: (qb) => ({
    getMyAccounts: qb.query({
      query: () => ({ url: '/accounts' }),
      providesTags: ['ACCOUNTS'],
    }),
  }),
});

export const accountsApiReducer = accountsApi.reducer;
export const accountsApiAction = {
  middleware: accountsApi.middleware,
  reducerPath: accountsApi.reducerPath,
  getMyAccounts: accountsApi.useGetMyAccountsQuery,
};
