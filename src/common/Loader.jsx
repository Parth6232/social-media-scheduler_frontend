import { Backdrop, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';

const Loader = ({ fullPage = true, inline = false }) => {
  const isLoading = useSelector((state) => state.auth.isLoading);

  if (inline) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress color="primary" />
      </div>
    );
  }

  if (fullPage && !isLoading) return null;

  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}
      open={fullPage ? isLoading : true}
    >
      <CircularProgress color="primary" size={60} thickness={4} />
    </Backdrop>
  );
};

export default Loader;
