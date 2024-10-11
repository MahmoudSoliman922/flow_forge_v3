import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { List, LogIn, LogOut, Share2, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-gray-100 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Share2 className="mr-2 text-purple-400" />
            <span className="font-bold text-xl text-purple-400">Flow Forge</span>
          </Link>
          <div className="flex space-x-4">
            {isLoggedIn && (
              <>
                <Link to="/" className="flex items-center hover:bg-gray-700 px-3 py-2 rounded transition-colors duration-200">
                  <Home className="mr-1" size={18} />
                  Home
                </Link>
                <Link to="/manage-flows" className="flex items-center hover:bg-gray-700 px-3 py-2 rounded transition-colors duration-200">
                  <List className="mr-1" size={18} />
                  Manage Flows
                </Link>
                <button onClick={handleLogout} className="flex items-center hover:bg-gray-700 px-3 py-2 rounded transition-colors duration-200">
                  <LogOut className="mr-1" size={18} />
                  Logout
                </button>
              </>
            )}
            {!isLoggedIn && (
              <Link to="/login" className="flex items-center hover:bg-gray-700 px-3 py-2 rounded transition-colors duration-200">
                <LogIn className="mr-1" size={18} />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
