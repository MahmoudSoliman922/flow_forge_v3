import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, Download, Upload, RefreshCw, Play } from 'lucide-react';
import { useFlows } from '../contexts/FlowContext';

interface Cell {
  id: number;
  code: string;
  dependencies: string;
  server: string;
  service: string;
  output?: string;
}

interface FlowMetadata {
  title: string;
  author: string;
  version: string;
  description: string;
}

interface Flow {
  id: number;
  name: string;
  metadata: FlowMetadata;
  cells: Cell[];
}

const FlowEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<Flow | null>(null);
  const { updateFlowMetadata } = useFlows();
  const [nextId, setNextId] = useState(1);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saveAsNewVersion, setSaveAsNewVersion] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const servers = ['Server A', 'Server B', 'Server C'];
  const servicesByServer = {
    'Server A': ['Service 1', 'Service 2', 'Service 3'],
    'Server B': ['Service 4', 'Service 5', 'Service 6'],
    'Server C': ['Service 7', 'Service 8', 'Service 9'],
  };

  useEffect(() => {
    if (id) {
      const storedFlows = JSON.parse(localStorage.getItem('flows') || '[]');
      const currentFlow = storedFlows.find((f: Flow) => f.id === parseInt(id));
      if (currentFlow) {
        setFlow(currentFlow);
        setNextId(Math.max(...currentFlow.cells.map((cell: Cell) => cell.id)) + 1);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    if (flow) {
      const storedFlows = JSON.parse(localStorage.getItem('flows') || '[]');
      const updatedFlows = storedFlows.map((f: Flow) => f.id === flow.id ? flow : f);
      localStorage.setItem('flows', JSON.stringify(updatedFlows));
    }
  }, [flow]);

  const addCell = () => {
    if (flow) {
      const newCell: Cell = {
        id: nextId,
        code: '// Enter your code here',
        dependencies: '',
        server: servers[0],
        service: servicesByServer[servers[0]][0]
      };
      setFlow({ ...flow, cells: [...flow.cells, newCell] });
      setNextId(nextId + 1);
    }
  };

  const updateCell = (id: number, field: keyof Cell, value: string) => {
    if (flow) {
      setFlow({
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
      });
    }
  };

  const deleteCell = (id: number) => {
    if (flow) {
      setFlow({ ...flow, cells: flow.cells.filter(cell => cell.id !== id) });
    }
  };

  const executeCell = (id: number) => {
    if (flow) {
      // Mock backend response
      const mockOutput = `Executed cell ${id}\nOutput: Success`;
      setFlow({
        ...flow,
        cells: flow.cells.map(cell => {
          if (cell.id === id) {
            return { ...cell, output: mockOutput };
          }
          return cell;
        })
      });
    }
  };

  const executeAllCells = () => {
    if (flow) {
      // Mock backend response for all cells
      setFlow({
        ...flow,
        cells: flow.cells.map(cell => ({
          ...cell,
          output: `Executed cell ${cell.id}\nOutput: Success for all cells`
        }))
      });
    }
  };

  const saveFlow = () => {
    setShowSavePrompt(true);
  };

  const handleSaveFlow = () => {
    if (flow) {
      const storedFlows = JSON.parse(localStorage.getItem('flows') || '[]');
      if (saveAsNewVersion) {
        // Logic to save as a new version of existing flow
        console.log('Saving as new version of flow:', selectedFlow);
      } else {
        // Logic to save as a new flow
        const updatedFlows = storedFlows.map((f: Flow) => f.id === flow.id ? flow : f);
        localStorage.setItem('flows', JSON.stringify(updatedFlows));
      }
    }
    setShowSavePrompt(false);
  };

  const downloadFlow = () => {
    if (flow) {
      const flowData = {
        metadata: flow.metadata,
        cells: flow.cells.map(({ id, ...rest }) => rest) // Exclude the id from the download
      };
      const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${flow.metadata.title.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const uploadFlow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flowData = JSON.parse(e.target?.result as string);
          if (flow) {
            setFlow({
              ...flow,
              metadata: flowData.metadata,
              cells: flowData.cells.map((cell: Omit<Cell, 'id'>, index: number) => ({
                ...cell,
                id: index + 1
              }))
            });
            setNextId(flowData.cells.length + 1);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Invalid flow file');
        }
      };
      reader.readAsText(file);
    }
  };

  const resetFlow = () => {
    setShowConfirmReset(true);
  };

  const confirmReset = () => {
    if (flow) {
      setFlow({
        ...flow,
        metadata: {
          title: 'Untitled Flow',
          author: '',
          version: '1.0.0',
          description: '',
        },
        cells: []
      });
    }
    setShowConfirmReset(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">FlowForge</h1>
      
      <div className="mb-6 flex space-x-4">
        <button onClick={downloadFlow} className="btn btn-primary flex items-center">
          <Download className="mr-2" size={18} />
          Download Flow
        </button>
        <label className="btn btn-secondary flex items-center cursor-pointer">
          <Upload className="mr-2" size={18} />
          Upload Flow
          <input type="file" onChange={uploadFlow} className="hidden" accept=".json" />
        </label>
        <button onClick={resetFlow} className="btn btn-danger flex items-center">
          <RefreshCw className="mr-2" size={18} />
          Reset
        </button>
      </div>

      {/* Flow Metadata */}
      {flow && (
        <>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Flow Metadata</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  value={flow.metadata.title}
                  onChange={(e) => {
                    setFlow({ ...flow, metadata: { ...flow.metadata, title: e.target.value } });
                    updateFlowMetadata(flow.id, { title: e.target.value });
                  }}
                  className="mt-1 block w-full rounded-md input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Author</label>
                <input
                  type="text"
                  value={flow.metadata.author}
                  onChange={(e) => setFlow({ ...flow, metadata: { ...flow.metadata, author: e.target.value } })}
                  className="mt-1 block w-full rounded-md input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Version</label>
                <input
                  type="text"
                  value={flow.metadata.version}
                  onChange={(e) => setFlow({ ...flow, metadata: { ...flow.metadata, version: e.target.value } })}
                  className="mt-1 block w-full rounded-md input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <input
                  type="text"
                  value={flow.metadata.description}
                  onChange={(e) => setFlow({ ...flow, metadata: { ...flow.metadata, description: e.target.value } })}
                  className="mt-1 block w-full rounded-md input"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-purple-400">Cells</h2>
            <button onClick={executeAllCells} className="btn btn-primary flex items-center">
              <Play className="mr-2" size={18} />
              Execute All Cells
            </button>
          </div>

          {flow.cells.map((cell, index) => (
            <div key={cell.id} className="mb-6 p-6 bg-gray-800 rounded-lg shadow-md">
              <div className="font-bold mb-4 text-purple-300">Cell #{index + 1}</div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Code</label>
                <textarea
                  value={cell.code}
                  onChange={(e) => updateCell(cell.id, 'code', e.target.value)}
                  className="w-full h-40 rounded-md input font-mono"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Dependencies (comma-separated)</label>
                <input
                  type="text"
                  value={cell.dependencies}
                  onChange={(e) => updateCell(cell.id, 'dependencies', e.target.value)}
                  className="w-full rounded-md input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Server</label>
                  <select
                    value={cell.server}
                    onChange={(e) => updateCell(cell.id, 'server', e.target.value)}
                    className="mt-1 block w-full rounded-md select"
                  >
                    {servers.map(server => (
                      <option key={server} value={server}>{server}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Service</label>
                  <select
                    value={cell.service}
                    onChange={(e) => updateCell(cell.id, 'service', e.target.value)}
                    className="mt-1 block w-full rounded-md select"
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
              <div className="flex justify-end space-x-4">
                <button onClick={() => executeCell(cell.id)} className="btn btn-primary flex items-center">
                  <Play className="mr-2" size={18} />
                  Execute
                </button>
                <button onClick={() => deleteCell(cell.id)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="mt-6 flex space-x-4">
        <button onClick={addCell} className="btn btn-secondary flex items-center">
          <Plus className="mr-2" size={18} />
          Add Cell
        </button>
        <button onClick={saveFlow} className="btn btn-primary flex items-center">
          <Save className="mr-2" size={18} />
          Add to My Flows
        </button>
      </div>

      {/* Save Flow Prompt */}
      {showSavePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Save Flow</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <input
                  type="radio"
                  checked={!saveAsNewVersion}
                  onChange={() => setSaveAsNewVersion(false)}
                  className="mr-2"
                />
                Save as new flow
              </label>
              <label className="block text-sm font-medium text-gray-300">
                <input
                  type="radio"
                  checked={saveAsNewVersion}
                  onChange={() => setSaveAsNewVersion(true)}
                  className="mr-2"
                />
                Save as new version of existing flow
              </label>
            </div>
            {saveAsNewVersion && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Flow</label>
                <select
                  value={selectedFlow}
                  onChange={(e) => setSelectedFlow(e.target.value)}
                  className="w-full rounded-md select"
                >
                  <option value="">Select a flow</option>
                  {existingFlows.map(flow => (
                    <option key={flow.id} value={flow.id}>{flow.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowSavePrompt(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveFlow} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Prompt */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Confirm Reset</h3>
            <p className="text-gray-300 mb-4">Are you sure you want to reset the flow? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowConfirmReset(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmReset} className="btn btn-danger">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowEditor;
