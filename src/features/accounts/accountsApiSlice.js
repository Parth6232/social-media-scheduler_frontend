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
    disconnectAccount: qb.mutation({
      query: (platform) => ({ url: `/accounts/${platform}`, method: 'DELETE' }),
      invalidatesTags: ['ACCOUNTS'],
    }),
  }),
});

export const accountsApiReducer = accountsApi.reducer;
export const accountsApiAction = {
  middleware: accountsApi.middleware,
  reducerPath: accountsApi.reducerPath,
  getMyAccounts: accountsApi.useGetMyAccountsQuery,
  disconnectAccount: accountsApi.useDisconnectAccountMutation,
};
