import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, Download, Upload, RefreshCw, Play } from 'lucide-react';
import { useFlows } from '../contexts/FlowContext';
import PublishFlowModal from './PublishFlowModal';
import { useAuth } from '../contexts/AuthContext';

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
  const { addTempFlow, updateTempFlow, updateTempFlowMetadata, publishFlow, liveFlows } = useFlows();
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
          // Fetch existing flow
          const response = await fetch(`/api/flows/${id}`);
          if (!response.ok) throw new Error('Failed to fetch flow');
          const fetchedFlow = await response.json();
          setFlow(fetchedFlow);
          setNextId(Math.max(...fetchedFlow.cells.map((cell: Cell) => cell.id)) + 1);
        } else {
          // Create a new flow
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
  }, [id, user, addTempFlow]);

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
      updateTempFlow(updatedFlow).catch(err => {
        setError('Failed to add cell');
        console.error(err);
      });
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
      updateTempFlow(updatedFlow).catch(err => {
        setError('Failed to update cell');
        console.error(err);
      });
    }
  };

  const deleteCell = (id: number) => {
    if (flow) {
      const updatedFlow = { ...flow, cells: flow.cells.filter(cell => cell.id !== id) };
      setFlow(updatedFlow);
      updateTempFlow(updatedFlow).catch(err => {
        setError('Failed to delete cell');
        console.error(err);
      });
    }
  };

  const executeCell = async (id: number) => {
    if (flow) {
      const cellToExecute = flow.cells.find(cell => cell.id === id);
      if (cellToExecute) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cellToExecute),
          });
          if (!response.ok) throw new Error('Failed to execute cell');
          const executedCell = await response.json();
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

  const executeAllCells = async () => {
    if (flow) {
      setIsLoading(true);
      setError(null);
      try {
        const executedCells = await Promise.all(
          flow.cells.map(async cell => {
            const response = await fetch('/api/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cell),
            });
            if (!response.ok) throw new Error(`Failed to execute cell ${cell.id}`);
            return response.json();
          })
        );
        const updatedFlow = { ...flow, cells: executedCells };
        setFlow(updatedFlow);
        updateTempFlow(updatedFlow);
      } catch (err) {
        setError('Error executing all cells');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
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

  const confirmReset = () => {
    if (flow) {
      const resetFlow = {
        ...flow,
        metadata: {
          title: 'Untitled Flow',
          author: user?.email || '',
          version: '1.0.0',
          description: '',
        },
        cells: []
      };
      setFlow(resetFlow);
      updateTempFlow(resetFlow).catch(err => {
        setError('Failed to reset flow');
        console.error(err);
      });
    }
    setShowConfirmReset(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!flow) return <div>No flow found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-purple-400">FlowForge</h1>
      
      {/* ... (keep the existing JSX, updating event handlers as necessary) */}

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
