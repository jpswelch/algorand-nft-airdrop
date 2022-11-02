import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  spacing: 8,
  palette: {
    primary: {
      light: '#426c8e',
      main: '#0c4160',
      dark: '#001b36',
      contrastText: '#c3ceda',
    },
    secondary: {
      light: '#a3bfd9',
      main: '#738fa7',
      dark: '#466278',
      contrastText: '#e4f1ff',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline enableColorScheme />
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
