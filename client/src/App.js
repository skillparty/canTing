import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import MenuManager from './pages/Menu/MenuManager';
import OrderManager from './pages/Orders/OrderManager';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Ruta de login */}
              <Route path="/login" element={<Login />} />
              
              {/* Rutas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Gestión de Menú */}
                <Route path="menu" element={<MenuManager />} />
                
                {/* Pedidos */}
                <Route path="orders" element={<OrderManager />} />
                
                {/* Pagos */}
                <Route path="payments" element={
                  <div className="page-placeholder">
                    <h2>Gestión de Pagos</h2>
                    <p>Página en desarrollo...</p>
                  </div>
                } />
                
                {/* Analíticas */}
                <Route path="analytics" element={
                  <div className="page-placeholder">
                    <h2>Analíticas</h2>
                    <p>Página en desarrollo...</p>
                  </div>
                } />
                
                {/* Mi Restaurante */}
                <Route path="restaurant" element={
                  <div className="page-placeholder">
                    <h2>Mi Restaurante</h2>
                    <p>Página en desarrollo...</p>
                  </div>
                } />
                
                {/* Usuarios */}
                <Route path="users" element={
                  <div className="page-placeholder">
                    <h2>Gestión de Usuarios</h2>
                    <p>Página en desarrollo...</p>
                  </div>
                } />
                
                {/* Configuración */}
                <Route path="settings" element={
                  <div className="page-placeholder">
                    <h2>Configuración</h2>
                    <p>Página en desarrollo...</p>
                  </div>
                } />
              </Route>
              
              {/* Ruta 404 */}
              <Route path="*" element={
                <div className="not-found">
                  <h1>404 - Página no encontrada</h1>
                  <p>La página que buscas no existe.</p>
                  <a href="/dashboard">Volver al Dashboard</a>
                </div>
              } />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  maxWidth: '500px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;