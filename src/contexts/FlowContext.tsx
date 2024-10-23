import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface Cell {
  id: number;
  code: string;
  dependencies: string;
  server: string;
  service: string;
  output?: string;
}

export interface Flow {
  id: number;
  metadata: {
    title: string;
    author: string;
    version: string;
    description: string;
  };
  cells: Cell[];
}

export interface LiveFlow extends Flow {
  versions: Flow[];
  liveVersion: string;
}

interface FlowContextType {
  tempFlows: Flow[];
  liveFlows: LiveFlow[];
  addTempFlow: (flow: Flow) => Promise<void>;
  deleteTempFlow: (id: number) => Promise<void>;
  updateTempFlow: (flow: Flow) => Promise<void>;
  updateTempFlowMetadata: (id: number, metadata: Partial<Flow['metadata']>) => Promise<void>;
  publishFlow: (flow: Flow, isNewFlow: boolean, existingFlowId?: number) => Promise<void>;
  deleteLiveFlow: (id: number) => Promise<void>;
  updateLiveFlow: (flow: LiveFlow) => Promise<void>;
  deleteFlowVersion: (flowId: number, versionId: number) => Promise<void>;
  executeCell: (flowId: number, cell: Cell) => Promise<string>;
}

const API_BASE_URL = 'http://localhost:8080';

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
    const fetchFlows = async () => {
      try {
        const tempResponse = await axios.get(`${API_BASE_URL}/temp-flows`);
        const liveResponse = await axios.get(`${API_BASE_URL}/live-flows`);
        setTempFlows(tempResponse.data || []);
        setLiveFlows(liveResponse.data || []);
      } catch (error) {
        console.error('Error fetching flows:', error);
        setTempFlows([]);
        setLiveFlows([]);
      }
    };
    fetchFlows();
  }, []);

  const addTempFlow = async (flow: Flow) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/temp-flows`, flow);
      setTempFlows(prevFlows => [...prevFlows, response.data]);
    } catch (error) {
      console.error('Error adding temp flow:', error);
    }
  };

  const deleteTempFlow = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/temp-flows/${id}`);
      setTempFlows(prevFlows => prevFlows.filter(flow => flow.id !== id));
    } catch (error) {
      console.error('Error deleting temp flow:', error);
    }
  };

  const updateTempFlow = async (updatedFlow: Flow) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/temp-flows/${updatedFlow.id}`, updatedFlow);
      setTempFlows(prevFlows => prevFlows.map(flow => flow.id === updatedFlow.id ? response.data : flow));
    } catch (error) {
      console.error('Error updating temp flow:', error);
    }
  };

  const updateTempFlowMetadata = async (id: number, metadata: Partial<Flow['metadata']>) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/temp-flows/${id}/metadata`, metadata);
      setTempFlows(prevFlows => prevFlows.map(flow => 
        flow.id === id ? { ...flow, metadata: { ...flow.metadata, ...response.data } } : flow
      ));
    } catch (error) {
      console.error('Error updating temp flow metadata:', error);
    }
  };

  const publishFlow = async (flow: Flow, isNewFlow: boolean, existingFlowId?: number) => {
    try {
      if (isNewFlow) {
        const response = await axios.post(`${API_BASE_URL}/live-flows`, flow);
        setLiveFlows(prevLiveFlows => [...prevLiveFlows, response.data]);
      } else if (existingFlowId) {
        const response = await axios.post(`${API_BASE_URL}/live-flows/${existingFlowId}/versions`, flow);
        setLiveFlows(prevLiveFlows => prevLiveFlows.map(liveFlow => 
          liveFlow.id === existingFlowId ? response.data : liveFlow
        ));
      }
      await deleteTempFlow(flow.id);
    } catch (error) {
      console.error('Error publishing flow:', error);
    }
  };

  const deleteLiveFlow = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/live-flows/${id}`);
      setLiveFlows(prevLiveFlows => prevLiveFlows.filter(flow => flow.id !== id));
    } catch (error) {
      console.error('Error deleting live flow:', error);
    }
  };

  const updateLiveFlow = async (updatedFlow: LiveFlow) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/live-flows/${updatedFlow.id}`, updatedFlow);
      setLiveFlows(prevLiveFlows => prevLiveFlows.map(flow => flow.id === updatedFlow.id ? response.data : flow));
    } catch (error) {
      console.error('Error updating live flow:', error);
    }
  };

  const deleteFlowVersion = async (flowId: number, versionId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/live-flows/${flowId}/versions/${versionId}`);
      setLiveFlows(prevLiveFlows => prevLiveFlows.map(flow => {
        if (flow.id === flowId) {
          const updatedVersions = flow.versions.filter(version => version.id !== versionId);
          return { ...flow, versions: updatedVersions };
        }
        return flow;
      }));
    } catch (error) {
      console.error('Error deleting flow version:', error);
    }
  };

  const executeCell = async (flowId: number, cell: Cell): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/execute`, {
        flowId,
        cellId: cell.id,
        code: cell.code,
        server: cell.server,
        service: cell.service,
        dependencies: cell.dependencies
      });
      return response.data.output;
    } catch (error) {
      console.error('Error executing cell:', error);
      throw error;
    }
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
      deleteFlowVersion,
      executeCell
    }}>
      {children}
    </FlowContext.Provider>
  );
};
