import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Diaconato } from './pages/Diaconato';
import { Louvor } from './pages/Louvor';
import { Mídia } from './pages/Midia';
import { Crianças } from './pages/Criancas';
import { Membros } from './pages/Membros';
import { Agenda } from './pages/Agenda';
import { Escalas } from './pages/Escalas';
import { CriarEscala } from './pages/CriarEscala';
import { EditarEscala } from './pages/EditarEscala';
import { MusicaDetalhes } from './pages/MusicaDetalhes';
import { ChordDetector } from './components/ChordDetector';
import ChordAnalysisScreen from './components/ChordAnalysisScreen';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Tema global com tamanhos consistentes
const theme = createTheme({
  typography: {
    fontSize: 14,
    htmlFontSize: 16,
    h1: { fontSize: '2rem' },
    h2: { fontSize: '1.75rem' },
    h3: { fontSize: '1.5rem' },
    h4: { fontSize: '1.25rem' },
    h5: { fontSize: '1.1rem' },
    h6: { fontSize: '1rem' },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8rem' },
    button: { fontSize: '0.875rem', textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontSize: '16px',
          WebkitTextSizeAdjust: '100%',
          MozTextSizeAdjust: '100%',
          msTextSizeAdjust: '100%',
        },
        body: {
          fontSize: '16px',
          overflowX: 'hidden',
        },
      },
    },
  },
});

// Componente para proteger rotas privadas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary 
        ignoreErrors={['removeChild', 'NotFoundError']}
      >
        <Router>
          <AuthProvider>
            <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas privadas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/agenda"
            element={
              <PrivateRoute>
                <Layout>
                  <Agenda />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/diaconato"
            element={
              <PrivateRoute>
                <Layout>
                  <Diaconato />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/louvor"
            element={
              <PrivateRoute>
                <Layout>
                  <Louvor />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/midia"
            element={
              <PrivateRoute>
                <Layout>
                  <Mídia />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/criancas"
            element={
              <PrivateRoute>
                <Layout>
                  <Crianças />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/membros"
            element={
              <PrivateRoute>
                <Layout>
                  <Membros />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/escalas"
            element={
              <PrivateRoute>
                <Layout>
                  <Escalas />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/criar-escala/:departmentId"
            element={
              <PrivateRoute>
                <Layout>
                  <CriarEscala />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/editar-escala/:scheduleId"
            element={
              <PrivateRoute>
                <Layout>
                  <EditarEscala />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/musica/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <MusicaDetalhes />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/detector-acordes"
            element={
              <PrivateRoute>
                <Layout>
                  <ChordDetector />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/chord-analysis"
            element={
              <PrivateRoute>
                <ChordAnalysisScreen />
              </PrivateRoute>
            }
          />
          
          {/* Redirecionar raiz para dashboard ou login */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
    </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
