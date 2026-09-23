import React from 'react';

const ChartCard = ({ title, children }) => {
  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      <div className="chart-container">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
