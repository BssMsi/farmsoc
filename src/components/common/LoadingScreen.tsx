
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="w-16 h-16 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-kisanly-primary font-medium">Loading...</p>
    </div>
  );
};

export default LoadingScreen;
