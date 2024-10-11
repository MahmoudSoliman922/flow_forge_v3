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

interface LiveFlow extends Flow {
  versions: Flow[];
  liveVersion: string;
}

interface FlowContextType {
  tempFlows: Flow[];
  liveFlows: LiveFlow[];
  addTempFlow: (flow: Flow) => void;
  deleteTempFlow: (id: number) => void;
  updateTempFlow: (flow: Flow) => void;
  updateTempFlowMetadata: (id: number, metadata: Partial<Flow['metadata']>) => void;
  publishFlow: (flow: Flow, isNewFlow: boolean, existingFlowId?: number) => void;
  deleteLiveFlow: (id: number) => void;
  updateLiveFlow: (flow: LiveFlow) => void;
  deleteFlowVersion: (flowId: number, versionId: number) => void;
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
  const [liveFlows, setLiveFlows] = useState<LiveFlow[]>([]);

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
    setTempFlows(prevFlows => [...prevFlows, flow]);
  };

  const deleteTempFlow = (id: number) => {
    setTempFlows(prevFlows => prevFlows.filter(flow => flow.id !== id));
  };

  const updateTempFlow = (updatedFlow: Flow) => {
    setTempFlows(prevFlows => prevFlows.map(flow => flow.id === updatedFlow.id ? updatedFlow : flow));
  };

  const updateTempFlowMetadata = (id: number, metadata: Partial<Flow['metadata']>) => {
    setTempFlows(prevFlows => prevFlows.map(flow => 
      flow.id === id 
        ? { ...flow, metadata: { ...flow.metadata, ...metadata } }
        : flow
    ));
  };

  const publishFlow = (flow: Flow, isNewFlow: boolean, existingFlowId?: number) => {
    if (isNewFlow) {
      const newLiveFlow: LiveFlow = {
        ...flow,
        id: Date.now(),
        versions: [{ ...flow, id: Date.now() }],
        liveVersion: flow.metadata.version
      };
      setLiveFlows(prevLiveFlows => [...prevLiveFlows, newLiveFlow]);
    } else if (existingFlowId) {
      setLiveFlows(prevLiveFlows => prevLiveFlows.map(liveFlow => {
        if (liveFlow.id === existingFlowId) {
          return {
            ...liveFlow,
            versions: [...liveFlow.versions, { ...flow, id: Date.now() }],
            // Don't change the liveVersion when adding a new version
            // liveVersion: flow.metadata.version
          };
        }
        return liveFlow;
      }));
    }
    setTempFlows(prevTempFlows => prevTempFlows.filter(f => f.id !== flow.id));
  };

  // Add this function to get live flows
  const getLiveFlows = () => {
    return liveFlows;
  };

  const deleteLiveFlow = (id: number) => {
    setLiveFlows(prevLiveFlows => prevLiveFlows.filter(flow => flow.id !== id));
  };

  const updateLiveFlow = (updatedFlow: LiveFlow) => {
    setLiveFlows(prevLiveFlows => prevLiveFlows.map(flow => flow.id === updatedFlow.id ? updatedFlow : flow));
  };

  const deleteFlowVersion = (flowId: number, versionId: number) => {
    setLiveFlows(prevLiveFlows => prevLiveFlows.map(flow => {
      if (flow.id === flowId) {
        const updatedVersions = flow.versions.filter(version => version.id !== versionId);
        return { ...flow, versions: updatedVersions };
      }
      return flow;
    }));
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
      deleteLiveFlow,
      updateLiveFlow,
      getLiveFlows,
      deleteFlowVersion
    }}>
      {children}
    </FlowContext.Provider>
  );
};
