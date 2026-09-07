import { createApi } from '@reduxjs/toolkit/query/react';
import { apiSliceInterceptor } from '../../store/redux/apiSliceInterceptor';

const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: apiSliceInterceptor.baseQueryWithInterceptor,
  endpoints: (qb) => ({
    generateCaption: qb.mutation({
      query: (data) => ({
        url: '/ai/generate-caption',
        method: 'POST',
        body: data,
      }),
    }),
    generateImage: qb.mutation({
      query: (data) => ({
        url: '/ai/generate-image',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const aiApiReducer = aiApi.reducer;
export const aiApiAction = {
  middleware: aiApi.middleware,
  reducerPath: aiApi.reducerPath,
  generateCaption: aiApi.useGenerateCaptionMutation,
  generateImage: aiApi.useGenerateImageMutation,
};
