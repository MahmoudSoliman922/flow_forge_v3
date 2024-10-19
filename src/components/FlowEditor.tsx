import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, Download, Upload, RefreshCw, Play, Trash2 } from 'lucide-react';
import { useFlows, Flow, Cell } from '../contexts/FlowContext';
import PublishFlowModal from './PublishFlowModal';
import { useAuth } from '../contexts/AuthContext';

const FlowEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<Flow | null>(null);
  const { addTempFlow, updateTempFlow, updateTempFlowMetadata, publishFlow, liveFlows, tempFlows } = useFlows();
  const { user } = useAuth();
  const [nextId, setNextId] = useState(1);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const servers = ['Server A', 'Server B', 'Server C'];
  const servicesByServer: { [key: string]: string[] } = {
    'Server A': ['Service 1', 'Service 2', 'Service 3'],
    'Server B': ['Service 4', 'Service 5', 'Service 6'],
    'Server C': ['Service 7', 'Service 8', 'Service 9'],
  };

  useEffect(() => {
    const fetchOrCreateFlow = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (id) {
          const existingFlow = tempFlows.find(f => f.id === parseInt(id));
          console.log("tempFlows", tempFlows, "id", id)
          if (existingFlow) {
            setFlow(existingFlow);
            setNextId(Math.max(...existingFlow.cells.map((cell: Cell) => cell.id), 0) + 1);
          } else {
            setError('Flow not found');
            // navigate('/manage-flows'); // Redirect to manage flows page if flow is not found
          }
        } else {
          const newFlow: Flow = {
            id: Date.now(),
            name: 'New Flow',
            metadata: {
              title: 'Untitled Flow',
              author: user?.email || '',
              version: '1.0.0',
              description: '',
            },
            cells: []
          };
          await addTempFlow(newFlow);
          setFlow(newFlow);
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching or creating flow');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrCreateFlow();
  }, [id, user, addTempFlow, tempFlows]);

  const handleMetadataChange = (field: keyof Flow['metadata'], value: string) => {
    if (flow) {
      const updatedFlow = {
        ...flow,
        metadata: {
          ...flow.metadata,
          [field]: value
        }
      };
      setFlow(updatedFlow);
      updateTempFlow(updatedFlow);
    }
  };

  const handlePublish = async (isNewFlow: boolean, existingFlowId?: number) => {
    if (flow) {
      setIsLoading(true);
      setError(null);
      try {
        await publishFlow(flow, isNewFlow, existingFlowId);
        setShowPublishModal(false);
        navigate('/manage-flows');
      } catch (err) {
        setError('Error publishing flow');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addCell = () => {
    if (flow) {
      const newCell: Cell = {
        id: nextId,
        code: '// Enter your code here',
        dependencies: '',
        server: servers[0],
        service: servicesByServer[servers[0]][0]
      };
      const updatedFlow = { ...flow, cells: [...flow.cells, newCell] };
      setFlow(updatedFlow);
      setNextId(nextId + 1);
      updateTempFlow(updatedFlow);
    }
  };

  const updateCell = (id: number, field: keyof Cell, value: string) => {
    if (flow) {
      const updatedFlow = {
        ...flow,
        cells: flow.cells.map(cell => {
          if (cell.id === id) {
            if (field === 'server') {
              return { ...cell, [field]: value, service: servicesByServer[value][0] };
            }
            return { ...cell, [field]: value };
          }
          return cell;
        })
      };
      setFlow(updatedFlow);
      updateTempFlow(updatedFlow);
    }
  };

  const deleteCell = (id: number) => {
    if (flow) {
      const updatedFlow = { ...flow, cells: flow.cells.filter(cell => cell.id !== id) };
      setFlow(updatedFlow);
      updateTempFlow(updatedFlow);
    }
  };

  const executeCell = async (id: number) => {
    if (flow) {
      const cellToExecute = flow.cells.find(cell => cell.id === id);
      if (cellToExecute) {
        setIsLoading(true);
        setError(null);
        try {
          // Mock execution for now
          const executedCell = { ...cellToExecute, output: `Executed cell ${id}\nOutput: Success` };
          const updatedFlow = {
            ...flow,
            cells: flow.cells.map(cell => cell.id === id ? executedCell : cell)
          };
          setFlow(updatedFlow);
          updateTempFlow(updatedFlow);
        } catch (err) {
          setError('Error executing cell');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!flow) return <div>No flow found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-purple-400">FlowForge</h1>
      
      {/* Flow Metadata */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">Flow Metadata</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              value={flow.metadata.title}
              onChange={(e) => handleMetadataChange('title', e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Author</label>
            <input
              type="text"
              value={flow.metadata.author}
              readOnly
              className="mt-1 block w-full rounded-md bg-gray-700 text-white p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Version</label>
            <input
              type="text"
              value={flow.metadata.version}
              onChange={(e) => handleMetadataChange('version', e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <input
              type="text"
              value={flow.metadata.description}
              onChange={(e) => handleMetadataChange('description', e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white p-2"
            />
          </div>
        </div>
      </div>

      {/* Cells */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">Cells</h2>
        {flow.cells.map((cell, index) => (
          <div key={cell.id} className="bg-gray-800 p-6 rounded-lg shadow-md mb-4">
            <h3 className="text-xl font-bold mb-2 text-purple-300">Cell #{index + 1}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Code</label>
              <textarea
                value={cell.code}
                onChange={(e) => updateCell(cell.id, 'code', e.target.value)}
                className="w-full h-32 rounded-md bg-gray-700 text-white p-2 font-mono"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Dependencies</label>
              <input
                type="text"
                value={cell.dependencies}
                onChange={(e) => updateCell(cell.id, 'dependencies', e.target.value)}
                className="w-full rounded-md bg-gray-700 text-white p-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Server</label>
                <select
                  value={cell.server}
                  onChange={(e) => updateCell(cell.id, 'server', e.target.value)}
                  className="w-full rounded-md bg-gray-700 text-white p-2"
                >
                  {servers.map(server => (
                    <option key={server} value={server}>{server}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Service</label>
                <select
                  value={cell.service}
                  onChange={(e) => updateCell(cell.id, 'service', e.target.value)}
                  className="w-full rounded-md bg-gray-700 text-white p-2"
                >
                  {servicesByServer[cell.server].map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
            </div>
            {cell.output && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Output</label>
                <pre className="bg-gray-900 p-4 rounded-md text-green-400 font-mono">{cell.output}</pre>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => executeCell(cell.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                <Play className="inline-block mr-2" size={16} />
                Execute
              </button>
              <button
                onClick={() => deleteCell(cell.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                <Trash2 className="inline-block mr-2" size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={addCell}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          <Plus className="inline-block mr-2" size={16} />
          Add Cell
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowPublishModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          <Save className="inline-block mr-2" size={16} />
          Publish Flow
        </button>
      </div>

      {showPublishModal && (
        <PublishFlowModal
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
          liveFlows={liveFlows}
        />
      )}
    </div>
  );
};

export default FlowEditor;
