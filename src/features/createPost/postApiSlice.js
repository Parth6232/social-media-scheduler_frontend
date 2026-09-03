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
      query: () => ({ url: '/posts' }),
      providesTags: ['POSTS'],
    }),
  }),
});

export const postApiReducer = postApi.reducer;
export const postApiAction = {
  middleware: postApi.middleware,
  reducerPath: postApi.reducerPath,
  createPost: postApi.useCreatePostMutation,
  getPosts: postApi.useGetPostsQuery,
};
