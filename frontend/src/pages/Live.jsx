import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  getLiveStatus, startLiveSimulation, stopLiveSimulation, 
  simulateOneUpdate, resetLiveDataset 
} from '../services/api';

const Live = () => {
  const { globalCacheTimestamp, setGlobalCacheTimestamp } = useOutletContext();
  const [status, setStatus] = useState(null);
  const [role, setRole] = useState('Viewer');
  const [intervalOption, setIntervalOption] = useState(10000);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const fetchStatus = async () => {
    try {
      const data = await getLiveStatus();
      setStatus(data);
      if (setGlobalCacheTimestamp && data.cache_last_updated) {
        if (data.cache_last_updated !== globalCacheTimestamp) {
          setGlobalCacheTimestamp(data.cache_last_updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [globalCacheTimestamp]);

  const handleApiCall = async (apiFunc, ...args) => {
    try {
      setError('');
      setSuccessMsg('');
      const res = await apiFunc(...args);
      setSuccessMsg(res.message || 'Success');
      await fetchStatus();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!status) return <div style={{ padding: '20px' }}>Loading...</div>;

  const isAdmin = role === 'Admin';
  
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '4px' }}>Live Data Simulation</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and simulate changing academic data using the local working dataset.</p>
      </div>
      
      <div className="filter-card" style={{ backgroundColor: 'var(--card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Select Role:</label>
          <select value={role} onChange={(e) => {setRole(e.target.value); setError('');}} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <option value="Viewer">Viewer</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>MODE</div>
          <div style={{ fontSize: '1.2rem', color: '#FF8F00', fontWeight: 'bold' }}>Simulation Mode</div>
          <div style={{ fontSize: '0.9rem', color: '#2E7D32' }}>● Connected - Local Dataset</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontStyle: 'italic', fontSize: '0.9rem' }}>
        Simulation Mode modifies the local working dataset for demonstration/testing. It does not represent real-time institutional data.
      </div>

      {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>Error: {error}</div>}
      {successMsg && <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>{successMsg}</div>}

      <div className="filter-card" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            onClick={() => handleApiCall(startLiveSimulation, role, intervalOption)} 
            disabled={!isAdmin || status.is_running}
            style={{ padding: '8px 16px', backgroundColor: (isAdmin && !status.is_running) ? 'var(--primary-color)' : '#e0e0e0', color: (isAdmin && !status.is_running) ? 'white' : '#9e9e9e', border: 'none', borderRadius: '4px', cursor: (isAdmin && !status.is_running) ? 'pointer' : 'not-allowed', fontWeight: '500' }}>
            Start Simulation
          </button>
          <button 
            onClick={() => handleApiCall(stopLiveSimulation, role)} 
            disabled={!isAdmin || !status.is_running}
            style={{ padding: '8px 16px', backgroundColor: (isAdmin && status.is_running) ? '#d32f2f' : '#e0e0e0', color: (isAdmin && status.is_running) ? 'white' : '#9e9e9e', border: 'none', borderRadius: '4px', cursor: (isAdmin && status.is_running) ? 'pointer' : 'not-allowed', fontWeight: '500' }}>
            Stop Simulation
          </button>
          <button 
            onClick={() => handleApiCall(simulateOneUpdate, role)} 
            disabled={!isAdmin || status.is_running}
            style={{ padding: '8px 16px', backgroundColor: (isAdmin && !status.is_running) ? '#1976d2' : '#e0e0e0', color: (isAdmin && !status.is_running) ? 'white' : '#9e9e9e', border: 'none', borderRadius: '4px', cursor: (isAdmin && !status.is_running) ? 'pointer' : 'not-allowed', fontWeight: '500' }}>
            Simulate One Update
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', marginRight: '16px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Interval:</label>
            <select value={intervalOption} onChange={(e) => setIntervalOption(Number(e.target.value))} disabled={!isAdmin || status.is_running} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
            </select>
          </div>

          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to reset the live dataset to the original dataset? All simulated changes will be lost.')) {
                handleApiCall(resetLiveDataset, role);
              }
            }} 
            disabled={!isAdmin}
            style={{ padding: '8px 16px', backgroundColor: isAdmin ? '#FF8F00' : '#e0e0e0', color: isAdmin ? 'white' : '#9e9e9e', border: 'none', borderRadius: '4px', cursor: isAdmin ? 'pointer' : 'not-allowed', fontWeight: '500' }}>
            Reset Live Dataset
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: status.is_running ? '#FF8F00' : 'var(--text-main)' }}>
          Simulation Status: {status.is_running ? 'RUNNING' : 'STOPPED'}
        </div>
        <div><strong>Last Simulation Update:</strong> {status.last_update}</div>
        <div><strong>Updates Performed:</strong> {status.update_count}</div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Simulation Event Log</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Dataset</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Record ID</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Field Changed</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Old Value</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>New Value</th>
              </tr>
            </thead>
            <tbody>
              {status.log_entries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent events</td>
                </tr>
              ) : (
                status.log_entries.map((entry, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>{entry.timestamp}</td>
                    <td style={{ padding: '12px 16px' }}>{entry.dataset}</td>
                    <td style={{ padding: '12px 16px' }}>{entry.record_id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{entry.field_changed}</td>
                    <td style={{ padding: '12px 16px', color: '#c62828' }}>{entry.old_value}</td>
                    <td style={{ padding: '12px 16px', color: '#2e7d32', fontWeight: 'bold' }}>{entry.new_value}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Live;
