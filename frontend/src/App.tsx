import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import OpsDashboard from './pages/OpsDashboard';
import FanApp from './pages/FanApp';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
