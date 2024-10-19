import React, { useState } from 'react';

interface PublishFlowModalProps {
  onClose: () => void;
  onPublish: (isNewFlow: boolean, existingFlowId?: number) => void;
  liveFlows: any[]; // Replace 'any' with your Flow type
}

const PublishFlowModal: React.FC<PublishFlowModalProps> = ({ onClose, onPublish, liveFlows }) => {
  const [isNewFlow, setIsNewFlow] = useState(true);
  const [selectedFlowId, setSelectedFlowId] = useState<number | undefined>(undefined);

  const handlePublish = () => {
    onPublish(isNewFlow, isNewFlow ? undefined : selectedFlowId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-bold mb-4 text-purple-400">Publish Flow</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <input
              type="radio"
              checked={isNewFlow}
              onChange={() => setIsNewFlow(true)}
              className="mr-2"
            />
            Create as a new flow
          </label>
          <label className="block text-sm font-medium text-gray-300">
            <input
              type="radio"
              checked={!isNewFlow}
              onChange={() => setIsNewFlow(false)}
              className="mr-2"
            />
            Add as a version to an existing flow
          </label>
        </div>
        {!isNewFlow && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select existing flow:
            </label>
            <select
              value={selectedFlowId}
              onChange={(e) => setSelectedFlowId(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded p-2"
            >
              <option value="">Select a flow</option>
              {liveFlows.map((flow) => (
                <option key={flow.id} value={flow.id}>
                  {flow.metadata ? flow.metadata.title : 'Untitled Flow'}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handlePublish}
            className="btn btn-primary"
            disabled={!isNewFlow && !selectedFlowId}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishFlowModal;
