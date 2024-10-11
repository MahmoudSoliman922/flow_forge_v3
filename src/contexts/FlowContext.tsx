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

  return (
    <FlowContext.Provider value={{ flows, addFlow, deleteFlow, updateFlow }}>
      {children}
    </FlowContext.Provider>
  );
};
