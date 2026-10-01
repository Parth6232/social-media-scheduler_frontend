import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store, persistor } from './store/reduxStore.js';
import { getAppTheme } from './theme/theme.js';
import App from './App.jsx';
import './index.css';

const AppWithTheme = () => {
  const themeMode = useSelector((state) => state.ui?.themeMode || 'light');
  const appTheme = getAppTheme(themeMode);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

// feeds the cursor-following border light on every MUI Card
document.addEventListener('pointermove', (e) => {
  const card = e.target.closest?.('.MuiCard-root');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
}, { passive: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWithTheme />
      </PersistGate>
    </Provider>
  </StrictMode>,
);