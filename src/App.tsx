import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FlowProvider } from './contexts/FlowContext';
import Login from './components/Login';
import FlowEditor from './components/FlowEditor';
import ManageFlows from './components/ManageFlows';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ForkFlow from './components/ForkFlow';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/flows/:id" element={<ProtectedRoute><FlowEditor /></ProtectedRoute>} />
          <Route path="/manage-flows" element={<ProtectedRoute><ManageFlows /></ProtectedRoute>} />
          <Route path="/fork-flow/:flowId/:version" element={<ProtectedRoute><ForkFlow /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FlowProvider>
        <Router>
          <AppContent />
        </Router>
      </FlowProvider>
    </AuthProvider>
  );
}

export default App;
