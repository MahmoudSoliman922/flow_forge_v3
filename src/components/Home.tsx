import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold text-purple-400 mb-8">Welcome to Flow Forge</h1>
      <p className="text-xl text-gray-300 mb-12">Create and manage your flows with ease</p>
      <button
        onClick={handleRedirect}
        className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-4 shadow-lg transition-colors duration-200"
        aria-label="Create new flow"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

export default Home;
