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
  const themeMode = useSelector((state) => state.ui?.themeMode || 'dark');
  const appTheme = getAppTheme(themeMode);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWithTheme />
      </PersistGate>
    </Provider>
  </StrictMode>,
);