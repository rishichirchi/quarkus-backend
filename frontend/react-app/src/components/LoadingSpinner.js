import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
