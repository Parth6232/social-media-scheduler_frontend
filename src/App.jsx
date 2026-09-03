import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { hideToast } from './store/redux/slices/toastSlice';
import AppRoutes from './router/AppRoutes';
import Loader from './common/Loader';

// Global toast handler component
const ToastHandler = () => {
  const dispatch = useDispatch();
  const { open, message, variant } = useSelector((state) => state.toast);

  useEffect(() => {
    if (open) {
      enqueueSnackbar(message, { 
        variant,
        autoHideDuration: 4000,
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' }
      });
      dispatch(hideToast());
    }
  }, [open, message, variant, dispatch]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <SnackbarProvider maxSnack={3}>
        <ToastHandler />
        <Loader fullPage />
        <Suspense fallback={<Loader fullPage />}>
          <AppRoutes />
        </Suspense>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;
