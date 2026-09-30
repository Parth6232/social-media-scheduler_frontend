// NEW: Analytics API Slice
import { createApi } from '@reduxjs/toolkit/query/react';
import { apiSliceInterceptor } from '../../store/redux/apiSliceInterceptor';

const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: apiSliceInterceptor.baseQueryWithInterceptor,
  tagTypes: ['ANALYTICS', 'POSTS'],
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: ({ range, platform } = {}) => {
        const params = new URLSearchParams();
        if (range && range !== '30d') params.append('range', range);
        if (platform && platform !== 'all') params.append('platform', platform);
        const qs = params.toString();
        return { url: qs ? `/analytics?${qs}` : '/analytics' };
      },
      providesTags: ['ANALYTICS', 'POSTS'],
    }),
    refreshAnalyticsStats: builder.mutation({
      query: () => ({
        url: '/analytics/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['ANALYTICS'],
    }),
  }),
});

export const analyticsApiReducer = analyticsApi.reducer;
export const analyticsApiAction = {
  middleware: analyticsApi.middleware,
  reducerPath: analyticsApi.reducerPath,
  getAnalytics: analyticsApi.useGetAnalyticsQuery,
  refreshAnalyticsStats: analyticsApi.useRefreshAnalyticsStatsMutation,
  endpoints: analyticsApi.endpoints,
};
