import { Backdrop, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';

const Loader = ({ fullPage = true, inline = false, open }) => {
  const authLoading = useSelector((state) => state.auth?.isLoading);
  const isVisible = open !== undefined ? open : (fullPage ? authLoading : true);

  if (inline) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress color="primary" />
      </div>
    );
  }

  if (fullPage && !isVisible) return null;

  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}
      open={Boolean(isVisible)}
    >
      <CircularProgress color="primary" size={60} thickness={4} />
    </Backdrop>
  );
};

export default Loader;
