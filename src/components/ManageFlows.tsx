import React, { useState, useEffect } from 'react';
import { Trash2, GitFork } from 'lucide-react';
import { useFlows } from '../contexts/FlowContext';
import { useNavigate } from 'react-router-dom';

const ManageFlows: React.FC = () => {
  const { getLiveFlows, deleteLiveFlow, updateLiveFlow } = useFlows();
  const [liveFlows, setLiveFlows] = useState(getLiveFlows());
  const navigate = useNavigate();

  useEffect(() => {
    const updateFlows = () => setLiveFlows(getLiveFlows());
    updateFlows();

    window.addEventListener('focus', updateFlows);
    return () => window.removeEventListener('focus', updateFlows);
  }, [getLiveFlows]);

  const handleDeleteFlow = (id: number) => {
    deleteLiveFlow(id);
    setLiveFlows(getLiveFlows());
  };

  const handleSetLiveVersion = (flowId: number, version: string) => {
    const flow = liveFlows.find(f => f.id === flowId);
    if (flow) {
      updateLiveFlow({ ...flow, liveVersion: version });
      setLiveFlows(getLiveFlows());
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-purple-400 mb-8">Manage Flows</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {liveFlows.map(flow => (
          <div key={flow.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{flow.metadata.title}</h2>
              <button 
                className="bg-red-500 hover:bg-red-600 text-white rounded p-2"
                onClick={() => handleDeleteFlow(flow.id)}
              >
                <Trash2 size={20} />
              </button>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Versions:</h3>
            <ul>
              {flow.versions.map(version => (
                <li key={version.id} className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">
                    {version.metadata.version}
                    {version.metadata.version === flow.liveVersion && (
                      <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Live</span>
                    )}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                      onClick={() => handleSetLiveVersion(flow.id, version.metadata.version)}
                      disabled={version.metadata.version === flow.liveVersion}
                    >
                      Set Live
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded flex items-center"
                      onClick={() => navigate(`/fork-flow/${flow.id}/${version.metadata.version}`)}
                    >
                      <GitFork size={14} className="mr-1" />
                      Fork
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageFlows;
