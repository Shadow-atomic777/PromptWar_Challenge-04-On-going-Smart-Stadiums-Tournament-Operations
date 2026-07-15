import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const OpsDashboard = React.lazy(() => import('./pages/OpsDashboard'));
const FanApp = React.lazy(() => import('./pages/FanApp'));

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <LanguageProvider>
          <ErrorBoundary>
            <AuthProvider>
              <Router>
                <Suspense fallback={<div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-main)'}}>Loading OmniStadium...</div>}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Command Center Route */}
                    <Route path="/ops" element={
                      <ProtectedRoute>
                        <OpsDashboard />
                      </ProtectedRoute>
                    } />
                    
                    {/* Public Fan App Route */}
                    <Route path="/fan" element={<FanApp />} />
                  </Routes>
                </Suspense>
              </Router>
            </AuthProvider>
          </ErrorBoundary>
        </LanguageProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;
