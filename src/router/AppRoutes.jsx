import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import HomeRoute from './HomeRoute';
import AppLayoutContainer from '../features/layout/AppLayoutContainer';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import AccountsPage from '../pages/AccountsPage';
import CreatePostPage from '../pages/CreatePostPage';
import PostsPage from '../pages/PostsPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import PolicyPage from '../pages/PolicyPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public marketing landing page — redirects to /dashboard automatically once logged in */}
      <Route path="/" element={<HomeRoute />} />
      <Route path="/privacy-policy" element={<PolicyPage />} />
      <Route path="/terms-of-service" element={<PolicyPage />} />
      <Route path="/cookie-policy" element={<PolicyPage />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayoutContainer />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/:platform" element={<PostsPage />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
