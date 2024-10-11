import React, { createContext, useContext, useState, useEffect } from 'react';

interface Flow {
  id: number;
  name: string;
  metadata: {
    title: string;
    author: string;
    version: string;
    description: string;
  };
  cells: any[];
}

interface FlowContextType {
  flows: Flow[];
  addFlow: (flow: Flow) => void;
  deleteFlow: (id: number) => void;
  updateFlow: (flow: Flow) => void;
  updateFlowMetadata: (id: number, metadata: Partial<FlowMetadata>) => void;
  publishFlow: (flow: Flow, existingFlowId?: number) => void;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const useFlows = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlows must be used within a FlowProvider');
  }
  return context;
};

export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flows, setFlows] = useState<Flow[]>([]);

  useEffect(() => {
    const storedFlows = localStorage.getItem('flows');
    if (storedFlows) {
      setFlows(JSON.parse(storedFlows));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('flows', JSON.stringify(flows));
  }, [flows]);

  const addFlow = (flow: Flow) => {
    setFlows([...flows, flow]);
  };

  const deleteFlow = (id: number) => {
    setFlows(flows.filter(flow => flow.id !== id));
  };

  const updateFlow = (updatedFlow: Flow) => {
    setFlows(flows.map(flow => flow.id === updatedFlow.id ? updatedFlow : flow));
  };

  const updateFlowMetadata = (id: number, metadata: Partial<FlowMetadata>) => {
    setFlows(flows.map(flow => 
      flow.id === id 
        ? { ...flow, metadata: { ...flow.metadata, ...metadata } }
        : flow
    ));
  };

  const publishFlow = (flow: Flow, existingFlowId?: number) => {
    if (existingFlowId) {
      // Publish as a new version of an existing flow
      setFlows(flows.map(f => {
        if (f.id === existingFlowId) {
          const newVersion = {
            ...flow,
            id: Date.now(), // Assign a new id for the version
            parentId: existingFlowId
          };
          return {
            ...f,
            versions: [...(f.versions || []), newVersion],
            liveVersion: newVersion.metadata.version
          };
        }
        return f;
      }));
    } else {
      // Publish as a new flow
      const newFlow = {
        ...flow,
        id: Date.now(), // Assign a new id for the flow
        versions: [],
        liveVersion: flow.metadata.version
      };
      setFlows([...flows, newFlow]);
    }
  };

  return (
    <FlowContext.Provider value={{ flows, addFlow, deleteFlow, updateFlow, updateFlowMetadata, publishFlow }}>
      {children}
    </FlowContext.Provider>
  );
};
