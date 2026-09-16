import { createApi } from '@reduxjs/toolkit/query/react';
import { apiSliceInterceptor } from '../../store/redux/apiSliceInterceptor';

const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: apiSliceInterceptor.baseQueryWithInterceptor,
  tagTypes: ['MEDIA', 'MUSIC'],
  endpoints: (qb) => ({
    uploadMedia: qb.mutation({
      query: (formData) => ({
        url: '/media/upload',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),
    getFilters: qb.query({
      query: () => ({ url: '/media/filters' }),
    }),
    getMusicTracks: qb.query({
      query: () => ({ url: '/media/music' }),
      providesTags: ['MUSIC'],
    }),
    uploadUserAudio: qb.mutation({
      query: (formData) => ({
        url: '/media/upload-audio',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['MUSIC'],
    }),
    searchFreeMusic: qb.query({
      query: (q) => ({ url: `/media/free-music/search?q=${encodeURIComponent(q)}` }),
    }),
    importFreeTrack: qb.mutation({
      query: (body) => ({
        url: '/media/free-music/import',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MUSIC'],
    }),
    editMedia: qb.mutation({
      query: (body) => ({
        url: '/media/edit',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const mediaApiReducer = mediaApi.reducer;
export const mediaApiAction = {
  middleware: mediaApi.middleware,
  reducerPath: mediaApi.reducerPath,
  useUploadMediaMutation: mediaApi.useUploadMediaMutation,
  useGetFiltersQuery: mediaApi.useGetFiltersQuery,
  useGetMusicTracksQuery: mediaApi.useGetMusicTracksQuery,
  useEditMediaMutation: mediaApi.useEditMediaMutation,
  useUploadUserAudioMutation: mediaApi.useUploadUserAudioMutation,
  useSearchFreeMusicQuery: mediaApi.useSearchFreeMusicQuery,
  useImportFreeTrackMutation: mediaApi.useImportFreeTrackMutation,
};
