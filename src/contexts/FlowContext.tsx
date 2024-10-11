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
  tempFlows: Flow[];
  liveFlows: Flow[];
  addTempFlow: (flow: Flow) => void;
  deleteTempFlow: (id: number) => void;
  updateTempFlow: (flow: Flow) => void;
  updateTempFlowMetadata: (id: number, metadata: Partial<FlowMetadata>) => void;
  publishFlow: (flow: Flow) => void;
  deleteLiveFlow: (id: number) => void;
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
  const [tempFlows, setTempFlows] = useState<Flow[]>([]);
  const [liveFlows, setLiveFlows] = useState<Flow[]>([]);

  useEffect(() => {
    const storedTempFlows = localStorage.getItem('tempFlows');
    const storedLiveFlows = localStorage.getItem('liveFlows');
    if (storedTempFlows) {
      setTempFlows(JSON.parse(storedTempFlows));
    }
    if (storedLiveFlows) {
      setLiveFlows(JSON.parse(storedLiveFlows));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tempFlows', JSON.stringify(tempFlows));
    localStorage.setItem('liveFlows', JSON.stringify(liveFlows));
  }, [tempFlows, liveFlows]);

  const addTempFlow = (flow: Flow) => {
    setTempFlows([...tempFlows, flow]);
  };

  const deleteTempFlow = (id: number) => {
    setTempFlows(tempFlows.filter(flow => flow.id !== id));
  };

  const updateTempFlow = (updatedFlow: Flow) => {
    setTempFlows(tempFlows.map(flow => flow.id === updatedFlow.id ? updatedFlow : flow));
  };

  const updateTempFlowMetadata = (id: number, metadata: Partial<FlowMetadata>) => {
    setTempFlows(tempFlows.map(flow => 
      flow.id === id 
        ? { ...flow, metadata: { ...flow.metadata, ...metadata } }
        : flow
    ));
  };

  const publishFlow = (flow: Flow) => {
    const newLiveFlow = {
      ...flow,
      id: Date.now(), // Assign a new id for the live flow
      versions: [{ ...flow, id: Date.now() }],
      liveVersion: flow.metadata.version
    };
    setLiveFlows([...liveFlows, newLiveFlow]);
    setTempFlows(tempFlows.filter(f => f.id !== flow.id));
  };

  const deleteLiveFlow = (id: number) => {
    setLiveFlows(liveFlows.filter(flow => flow.id !== id));
  };

  return (
    <FlowContext.Provider value={{ 
      tempFlows, 
      liveFlows, 
      addTempFlow, 
      deleteTempFlow, 
      updateTempFlow, 
      updateTempFlowMetadata, 
      publishFlow,
      deleteLiveFlow
    }}>
      {children}
    </FlowContext.Provider>
  );
};
