import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
        This page is a placeholder for Phase 3 and will be fully implemented in a future phase.
      </p>
    </div>
  );
};

export default PlaceholderPage;
