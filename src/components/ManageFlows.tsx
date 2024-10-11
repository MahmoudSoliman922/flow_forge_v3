import React, { useState } from 'react';
import { Folder, GitBranch, Trash2, Edit, Check } from 'lucide-react';

interface Flow {
  id: string;
  name: string;
  versions: string[];
  liveVersion: string;
}

const ManageFlows: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([
    { id: '1', name: 'Flow 1', versions: ['1.0', '1.1', '1.2'], liveVersion: '1.1' },
    { id: '2', name: 'Flow 2', versions: ['1.0'], liveVersion: '1.0' },
  ]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteFlow = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDeleteFlow = () => {
    if (showDeleteConfirm) {
      setFlows(flows.filter(flow => flow.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    }
  };

  const handleOpenFlow = (flowId: string, version: string) => {
    console.log(`Opening flow ${flowId}, version ${version}`);
    // Implement logic to open the flow
  };

  const handleSetLiveVersion = (flowId: string, version: string) => {
    setFlows(flows.map(flow => {
      if (flow.id === flowId) {
        return { ...flow, liveVersion: version };
      }
      return flow;
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">Manage Flows</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map(flow => (
          <div key={flow.id} className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center text-purple-300">
                <Folder className="mr-2 text-purple-400" size={20} />
                {flow.name}
              </h2>
              <button
                onClick={() => handleDeleteFlow(flow.id)}
                className="text-red-400 hover:text-red-500 transition-colors duration-200"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2 text-gray-300">Versions:</h3>
              <ul className="space-y-2">
                {flow.versions.map(version => (
                  <li key={version} className="flex items-center justify-between text-gray-400">
                    <div className="flex items-center">
                      <GitBranch className="mr-2 text-green-400" size={16} />
                      {version}
                      {version === flow.liveVersion && (
                        <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">Live</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenFlow(flow.id, version)}
                        className="text-blue-400 hover:text-blue-500 transition-colors duration-200"
                      >
                        <Edit size={16} />
                      </button>
                      {version !== flow.liveVersion && (
                        <button
                          onClick={() => handleSetLiveVersion(flow.id, version)}
                          className="text-green-400 hover:text-green-500 transition-colors duration-200"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Confirm Deletion</h3>
            <p className="text-gray-300 mb-4">Are you sure you want to delete this flow? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowDeleteConfirm(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDeleteFlow} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFlows;