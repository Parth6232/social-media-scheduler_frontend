import { createApi } from '@reduxjs/toolkit/query/react';
import { apiSliceInterceptor } from '../../store/redux/apiSliceInterceptor';

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: apiSliceInterceptor.baseQueryWithInterceptor,
  endpoints: (qb) => ({
    login: qb.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: qb.mutation({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
    }),
    forgotPassword: qb.mutation({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: qb.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const authApiReducer = authApi.reducer;
export const authApiAction = {
  middleware: authApi.middleware,
  reducerPath: authApi.reducerPath,
  login: authApi.useLoginMutation,
  signup: authApi.useSignupMutation,
  forgotPassword: authApi.useForgotPasswordMutation,
  resetPassword: authApi.useResetPasswordMutation,
};
