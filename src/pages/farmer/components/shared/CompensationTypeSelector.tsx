import React from 'react';

interface CompensationTypeSelectorProps {
  compensationType: 'monetary' | 'product';
  setCompensationType: (type: 'monetary' | 'product') => void;
}

const CompensationTypeSelector: React.FC<CompensationTypeSelectorProps> = ({
  compensationType,
  setCompensationType,
}) => {
  return (
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Compensation Type
      </label>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setCompensationType('monetary')}
          className={`flex-1 px-4 py-2 rounded-lg border ${
            compensationType === 'monetary'
              ? 'bg-farmsoc-primary text-white border-farmsoc-primary'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Monetary Budget
        </button>
        <button
          type="button"
          onClick={() => setCompensationType('product')}
          className={`flex-1 px-4 py-2 rounded-lg border ${
            compensationType === 'product'
              ? 'bg-farmsoc-primary text-white border-farmsoc-primary'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Product Exchange
        </button>
      </div>
    </div>
  );
};

export default CompensationTypeSelector; 