import React from 'react';
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

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <AuthProvider>
        <FlowProvider>
          <Router>
            <AppContent />
          </Router>
        </FlowProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
