// NAYA: Shorts feature ka RTK Query API slice — analytics pattern follow karta hai
import { createApi } from '@reduxjs/toolkit/query/react';
import { apiSliceInterceptor } from '../../store/redux/apiSliceInterceptor';

const shortsApi = createApi({
  reducerPath: 'shortsApi',
  baseQuery: apiSliceInterceptor.baseQueryWithInterceptor,
  tagTypes: ['SHORTS_JOBS'],
  endpoints: (builder) => ({
    // POST /shorts/source-info  — video info fetch karo
    getSourceInfo: builder.mutation({
      query: (body) => ({
        url: '/shorts/source-info',
        method: 'POST',
        body,
      }),
    }),

    // POST /shorts/jobs — multipart FormData se job create karo
    createJob: builder.mutation({
      query: (formData) => ({
        url: '/shorts/jobs',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['SHORTS_JOBS'],
    }),

    // GET /shorts/jobs/:id — single job fetch (polling ke liye)
    getJob: builder.query({
      query: (id) => ({ url: `/shorts/jobs/${id}` }),
      providesTags: (_res, _err, id) => [{ type: 'SHORTS_JOBS', id }],
    }),

    // GET /shorts/jobs — last 20 jobs list
    listJobs: builder.query({
      query: () => ({ url: '/shorts/jobs' }),
      providesTags: ['SHORTS_JOBS'],
    }),

    // POST /shorts/jobs/:id/regenerate — same settings, naye timestamps
    regenerate: builder.mutation({
      query: (id) => ({
        url: `/shorts/jobs/${id}/regenerate`,
        method: 'POST',
      }),
      invalidatesTags: ['SHORTS_JOBS'],
    }),

    // DELETE /shorts/jobs/:id
    deleteJob: builder.mutation({
      query: (id) => ({
        url: `/shorts/jobs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SHORTS_JOBS'],
    }),

    // POST /shorts/jobs/:id/clips/:index/to-post — clip ko create-post me transfer
    clipToPost: builder.mutation({
      query: ({ jobId, index }) => ({
        url: `/shorts/jobs/${jobId}/clips/${index}/to-post`,
        method: 'POST',
      }),
    }),
  }),
});

export const shortsApiReducer = shortsApi.reducer;
export const shortsApiAction = {
  middleware: shortsApi.middleware,
  reducerPath: shortsApi.reducerPath,
  useGetSourceInfoMutation: shortsApi.useGetSourceInfoMutation,
  useCreateJobMutation: shortsApi.useCreateJobMutation,
  useGetJobQuery: shortsApi.useGetJobQuery,
  useListJobsQuery: shortsApi.useListJobsQuery,
  useRegenerateMutation: shortsApi.useRegenerateMutation,
  useDeleteJobMutation: shortsApi.useDeleteJobMutation,
  useClipToPostMutation: shortsApi.useClipToPostMutation,
  // RTK Query endpoints for cache management
  endpoints: shortsApi.endpoints,
};
