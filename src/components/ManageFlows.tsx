import React, { useState, useEffect } from 'react';
import { Trash2, GitFork, Check, XCircle } from 'lucide-react';
import { useFlows } from '../contexts/FlowContext';
import { useNavigate } from 'react-router-dom';

const ManageFlows: React.FC = () => {
  const { liveFlows, deleteLiveFlow, updateLiveFlow, deleteFlowVersion } = useFlows();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(false);
  }, [liveFlows]);

  const handleDeleteFlow = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteLiveFlow(id);
    } catch (err) {
      setError('Failed to delete flow');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetLiveVersion = async (flowId: number, version: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const flow = liveFlows.find(f => f.id === flowId);
      if (flow) {
        await updateLiveFlow({ ...flow, liveVersion: version });
      }
    } catch (err) {
      setError('Failed to set live version');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVersion = async (flowId: number, versionId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteFlowVersion(flowId, versionId);
    } catch (err) {
      setError('Failed to delete version');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-purple-400 mb-8">Manage Flows</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {liveFlows.map(flow => (
          <div key={flow.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{flow.versions[0].metadata.title}</h2>
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
                      className={`text-white rounded p-1 ${version.metadata.version === flow.liveVersion ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'}`}
                      onClick={() => handleSetLiveVersion(flow.id, version.metadata.version)}
                      disabled={version.metadata.version === flow.liveVersion}
                      title={version.metadata.version === flow.liveVersion ? "Current live version" : "Set as live version"}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white rounded p-1"
                      onClick={() => navigate(`/fork-flow/${flow.id}/${version.metadata.version}`)}
                      title="Fork this version"
                    >
                      <GitFork size={16} />
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white rounded p-1"
                      onClick={() => handleDeleteVersion(flow.id, version.id)}
                      disabled={version.metadata.version === flow.liveVersion}
                      title={version.metadata.version === flow.liveVersion ? "Cannot delete live version" : "Delete this version"}
                    >
                      <XCircle size={16} />
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
