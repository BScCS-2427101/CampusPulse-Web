import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-title">
        CampusPulse — Live Academic Analytics, Visualization & Storytelling System
      </div>
      <div className="data-source-note" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.82rem',
        color: '#2E7D32',
        backgroundColor: '#E8F5E9',
        border: '1px solid #C8E6C9',
        padding: '5px 12px',
        borderRadius: '20px',
        fontWeight: '500'
      }}>
        <span style={{
          display: 'inline-block',
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: '#2E7D32'
        }}></span>
        Academic sample dataset — simulated updates
      </div>
    </header>
  );
};

export default Header;

