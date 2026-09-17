import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../common/Loader';

// Keeps the landing page (and its 3D/animation dependencies) out of the
// bundle for users who are already authenticated and never see it.
const LandingPage = lazy(() => import('../pages/LandingPage'));

const HomeRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Removed redirect so logged-in users can still view the landing page if they want to.

  return (
    <Suspense fallback={<Loader fullPage />}>
      <LandingPage />
    </Suspense>
  );
};

export default HomeRoute;
