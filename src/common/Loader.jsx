import { Backdrop, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import FlightIcon from '@mui/icons-material/Flight';

const LOOP = 'M12 28 C12 6 48 6 48 28 C48 50 84 50 84 28 C84 6 48 6 48 28 C48 50 12 50 12 28 Z';

/** A small plane flying a figure-eight over a dashed route. */
const PlaneLoader = ({ size = 1 }) => (
  <Box role="status" aria-label="Loading" sx={{ position: 'relative', width: 96 * size, height: 56 * size }}>
    <svg viewBox="0 0 96 56" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <path d={LOOP} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />
    </svg>
    <Box sx={{ position: 'absolute', top: 0, left: 0, color: 'primary.main', lineHeight: 0, offsetPath: `path('${LOOP}')`, offsetRotate: 'auto', animation: 'pp-fly 2.6s linear infinite',
      '& svg': { transform: 'rotate(90deg)', fontSize: 20 * size } }}>
      <FlightIcon />
    </Box>
  </Box>
);

const Loader = ({ fullPage = true, inline = false, open }) => {
  const authLoading = useSelector((state) => state.auth?.isLoading);
  const isVisible = open !== undefined ? open : (fullPage ? authLoading : true);

  if (inline) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, color: 'text.primary' }}><PlaneLoader /></Box>;
  }
  if (fullPage && !isVisible) return null;

  return (
    <Backdrop sx={{ color: '#fff', bgcolor: 'rgba(10,11,14,0.72)', zIndex: (theme) => theme.zIndex.drawer + 999 }} open={Boolean(isVisible)}>
      <PlaneLoader size={1.3} />
    </Backdrop>
  );
};

export default Loader;
