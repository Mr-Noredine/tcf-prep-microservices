import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Auth from './pages/Auth/Auth';
import Exercises from './pages/Exercises/Exercises';
import ExerciceView from './pages/ExerciceView/ExerciceView';
import Dashboard from './pages/Dashboard/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <p style={{ fontSize: '1.2rem', color: '#757575' }}>Chargement...</p>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <div className="App">
      <Header />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/exercices" element={<ProtectedRoute><Exercises /></ProtectedRoute>} />
        <Route path="/exercice/:category/:level" element={<ProtectedRoute><ExerciceView /></ProtectedRoute>} />
        
        {/* Protected routes (require login) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Footer />
    </div>
  );
}

export default App;