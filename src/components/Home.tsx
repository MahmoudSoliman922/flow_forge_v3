import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Flow {
  id: number;
  name: string;
}

const Home: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const navigate = useNavigate();

  const addNewFlow = () => {
    const newFlow: Flow = {
      id: Date.now(),
      name: `New Flow ${flows.length + 1}`,
    };
    setFlows([...flows, newFlow]);
  };

  const deleteFlow = (id: number) => {
    setFlows(flows.filter(flow => flow.id !== id));
  };

  const editFlow = (id: number) => {
    navigate(`/flows/${id}`);
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-purple-400 mb-8 text-center">Welcome to Flow Forge</h1>
      <p className="text-xl text-gray-300 mb-12 text-center">Create and manage your flows with ease</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map(flow => (
          <div key={flow.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">{flow.name}</h2>
            <div className="flex justify-end">
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 mr-2"
                onClick={() => editFlow(flow.id)}
              >
                <Edit size={20} />
              </button>
              <button 
                className="bg-red-500 hover:bg-red-600 text-white rounded p-2"
                onClick={() => deleteFlow(flow.id)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={addNewFlow}
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-4 shadow-lg transition-colors duration-200"
          aria-label="Create new flow"
        >
          <Plus size={32} />
        </button>
      </div>
    </div>
  );
};

export default Home;
