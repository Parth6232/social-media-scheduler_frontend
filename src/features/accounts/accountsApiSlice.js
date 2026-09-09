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

    // UPDATED: ab { platform, accountId? } object leta hai.
    // Agar accountId diya gaya (specific FB/IG page) => DELETE /accounts/:platform/:accountId
    // Agar accountId nahi diya (YouTube jaise single-account platforms) => DELETE /accounts/:platform
    disconnectAccount: qb.mutation({
      query: ({ platform, accountId } = {}) => ({
        url: accountId
          ? `/accounts/${platform}/${accountId}`
          : `/accounts/${platform}`,
        method: 'DELETE',
      }),
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
