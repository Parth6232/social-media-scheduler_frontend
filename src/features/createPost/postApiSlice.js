import { createApi } from '@reduxjs/toolkit/query/react';
import { apiSliceInterceptor } from '../../store/redux/apiSliceInterceptor';

const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: apiSliceInterceptor.baseQueryWithInterceptor,
  tagTypes: ['POSTS'],
  endpoints: (qb) => ({
    createPost: qb.mutation({
      query: (formData) => ({
        url: '/posts',
        method: 'POST',
        body: formData,
        // Don't set Content-Type — browser sets it with boundary for multipart
        formData: true,
      }),
      invalidatesTags: ['POSTS'],
    }),
    getPosts: qb.query({
      query: (platform) => ({ url: platform ? `/posts?platform=${platform}` : '/posts' }),
      providesTags: ['POSTS'],
    }),
    getPlatformSummary: qb.query({
      query: () => ({ url: '/posts/summary' }),
      providesTags: ['POSTS'],
    }),
    refreshPostStats: qb.mutation({
      query: (postId) => ({ url: `/posts/${postId}/refresh-stats`, method: 'POST' }),
      invalidatesTags: ['POSTS'],
    }),
    deletePostTarget: qb.mutation({
      query: ({ postId, platform }) => ({ url: `/posts/${postId}/targets/${platform}`, method: 'DELETE' }),
      invalidatesTags: ['POSTS'],
    }),
  }),
});

export const postApiReducer = postApi.reducer;
export const postApiAction = {
  middleware: postApi.middleware,
  reducerPath: postApi.reducerPath,
  createPost: postApi.useCreatePostMutation,
  getPosts: postApi.useGetPostsQuery,
  getPlatformSummary: postApi.useGetPlatformSummaryQuery,
  refreshPostStats: postApi.useRefreshPostStatsMutation,
  deletePostTarget: postApi.useDeletePostTargetMutation,
};
