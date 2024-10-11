import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlows } from '../contexts/FlowContext';
import FlowEditor from './FlowEditor';

const ForkFlow: React.FC = () => {
  const { flowId, version } = useParams<{ flowId: string; version: string }>();
  const { getLiveFlows, addTempFlow } = useFlows();
  const navigate = useNavigate();
  const [flowData, setFlowData] = useState<any>(null);

  useEffect(() => {
    const liveFlows = getLiveFlows();
    const flow = liveFlows.find(f => f.id === Number(flowId));
    if (flow) {
      const versionData = flow.versions.find(v => v.metadata.version === version);
      if (versionData) {
        setFlowData({
          ...versionData,
          id: Date.now(), // Generate a new ID for the forked flow
          metadata: {
            ...versionData.metadata,
            title: `Fork of ${versionData.metadata.title}`,
            version: '1.0.0', // Reset version for the new fork
          },
        });
      }
    }
  }, [flowId, version, getLiveFlows]);

  useEffect(() => {
    if (flowData) {
      addTempFlow(flowData);
      navigate(`/flows/${flowData.id}`);
    }
  }, [flowData, addTempFlow, navigate]);

  if (!flowData) {
    return <div>Loading...</div>;
  }

  return <FlowEditor />;
};

export default ForkFlow;
