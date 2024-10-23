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
  const [localMetadata, setLocalMetadata] = useState<Flow['metadata'] | null>(null);
  const [localCells, setLocalCells] = useState<Cell[]>([]);
  const { addTempFlow, updateTempFlow, updateTempFlowMetadata, publishFlow, liveFlows, tempFlows, runCell } = useFlows();
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
          if (existingFlow) {
            setFlow(existingFlow);
            setLocalMetadata(existingFlow.metadata);
            setLocalCells(existingFlow.cells);
            setNextId(Math.max(...existingFlow.cells.map((cell: Cell) => cell.id), 0) + 1);
          } else {
            setError('Flow not found');
            navigate('/manage-flows'); // Redirect to manage flows page if flow is not found
          }
        } else {
          const newFlow: Flow = {
            id: Date.now(),
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
          setLocalMetadata(newFlow.metadata);
          setLocalCells(newFlow.cells);
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

  const handleLocalMetadataChange = (field: keyof Flow['metadata'], value: string) => {
    if (localMetadata) {
      setLocalMetadata({
        ...localMetadata,
        [field]: value
      });
    }
  };

  const handleMetadataBlur = () => {
    if (flow && localMetadata) {
      const updatedFlow = {
        ...flow,
        metadata: localMetadata
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
        code: `
        booking = Booking.create(booking_params)

        # your script MUST have this field at the end, whatever you want to present in the console or
        # use as input for other scripts should be included here, otherwise it won't be visible or usable
        # by other scripts
        output = {
          booking: booking
        }
        `,
        dependencies: `
        [
          {
            input_from: "user" => can be one of those: "user" | "script"
            input_schema: {
              "unit_code": {
                "type": string,
                "required": true
              },
              "eligible?": {
                "type": bool,
                "required": false
              }
            },
            input_name: "booking_params",
            input_type: "list" => can be of of those: "object" | "list", list means that its an array of objects
          },
          {
            input_from: "script",
            script_number: "2" => script number have to be 2 or higher
            input_name: "booking"  => coming from the output field in script 2
            input_type: "object"
          }
        ]
        `,
        server: servers[0],
        service: servicesByServer[servers[0]][0]
      };
      const updatedCells = [...localCells, newCell];
      setLocalCells(updatedCells);
      setNextId(nextId + 1);
    }
  };

  const updateLocalCell = (id: number, field: keyof Cell, value: string) => {
    setLocalCells(prevCells =>
      prevCells.map(cell => {
        if (cell.id === id) {
          if (field === 'server') {
            return { ...cell, [field]: value, service: servicesByServer[value][0] };
          }
          return { ...cell, [field]: value };
        }
        return cell;
      })
    );
  };

  const handleCellBlur = () => {
    if (flow) {
      const updatedFlow = {
        ...flow,
        cells: localCells
      };
      setFlow(updatedFlow);
      updateTempFlow(updatedFlow);
    }
  };

  const deleteCell = async (id: number) => {
    // Update local cells
    setLocalCells(prevCells => {
      const updatedCells = prevCells.filter(cell => cell.id !== id);
      
      // Update the flow with the new cells
      if (flow) {
        const updatedFlow = {
          ...flow,
          cells: updatedCells
        };
        setFlow(updatedFlow);
        updateTempFlow(updatedFlow);
      }
      
      return updatedCells;
    });
  };

  const executeCell = async (id: number) => {
    if (flow) {
      const cellToExecute = localCells.find(cell => cell.id === id);
      if (cellToExecute) {
        setIsLoading(true);
        setError(null);
        try {
          const newOutput = await runCell(flow.id, cellToExecute);
          if (newOutput !== cellToExecute.output) {
            const executedCell = { ...cellToExecute, output: newOutput };
            setLocalCells(prevCells =>
              prevCells.map(cell => cell.id === id ? executedCell : cell)
            );
            if (flow) {
              const updatedFlow = {
                ...flow,
                cells: localCells.map(cell => 
                  cell.id === id ? executedCell : cell
                )
              };
              setFlow(updatedFlow);
              updateTempFlow(updatedFlow);
            }
          }
        } catch (err) {
          console.error('Error executing cell:', err);
          // setError(err || 'Error executing cell');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!flow || !localMetadata) return <div>No flow found</div>;

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
              value={localMetadata.title}
              onChange={(e) => handleLocalMetadataChange('title', e.target.value)}
              onBlur={handleMetadataBlur}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Author</label>
            <input
              type="text"
              value={localMetadata.author}
              readOnly
              className="mt-1 block w-full rounded-md bg-gray-700 text-white p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Version</label>
            <input
              type="text"
              value={localMetadata.version}
              onChange={(e) => handleLocalMetadataChange('version', e.target.value)}
              onBlur={handleMetadataBlur}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <input
              type="text"
              value={localMetadata.description}
              onChange={(e) => handleLocalMetadataChange('description', e.target.value)}
              onBlur={handleMetadataBlur}
              className="mt-1 block w-full rounded-md bg-gray-700 text-white p-2"
            />
          </div>
        </div>
      </div>

      {/* Cells */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">Cells</h2>
        {localCells.map((cell, index) => (
          <div key={cell.id} className="bg-gray-800 p-6 rounded-lg shadow-md mb-4">
            <h3 className="text-xl font-bold mb-2 text-purple-300">Cell #{index + 1}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Code</label>
              <textarea
                value={cell.code}
                onChange={(e) => updateLocalCell(cell.id, 'code', e.target.value)}
                onBlur={handleCellBlur}
                className="w-full h-32 rounded-md bg-gray-700 text-white p-2 font-mono"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Dependencies</label>
              <textarea
                value={cell.dependencies}
                onChange={(e) => updateLocalCell(cell.id, 'dependencies', e.target.value)}
                onBlur={handleCellBlur}
                className="w-full h-32 rounded-md bg-gray-700 text-white p-2 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Server</label>
                <select
                  value={cell.server}
                  onChange={(e) => updateLocalCell(cell.id, 'server', e.target.value)}
                  onBlur={handleCellBlur}
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
                  onChange={(e) => updateLocalCell(cell.id, 'service', e.target.value)}
                  onBlur={handleCellBlur}
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
                onClick={(e) => {
                  e.preventDefault();
                  executeCell(cell.id)}}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                <Play className="inline-block mr-2" size={16} />
                Execute
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  deleteCell(cell.id);
                }}
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
