import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getDataQuality } from '../services/api';
import LoadingState from '../components/LoadingState';

const StatusBadge = ({ status }) => {
  let bgColor, color, icon;
  switch (status) {
    case 'Valid':
      bgColor = '#e8f5e9';
      color = '#2e7d32';
      icon = '✓';
      break;
    case 'Warning':
      bgColor = '#fff8e1';
      color = '#f57f17';
      icon = '⚠';
      break;
    case 'Issue':
      bgColor = '#ffebee';
      color = '#c62828';
      icon = '✖';
      break;
    default:
      bgColor = '#e0e0e0';
      color = '#616161';
      icon = '?';
  }
  return (
    <span style={{ 
      backgroundColor: bgColor, color, padding: '4px 12px', 
      borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold',
      display: 'inline-flex', alignItems: 'center', gap: '4px'
    }}>
      <span>{icon}</span> {status}
    </span>
  );
};

const DataQuality = () => {
  const { globalCacheTimestamp } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQualityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDataQuality();
      setData(result);
    } catch (err) {
      setError('Unable to load data quality information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityData();
  }, [globalCacheTimestamp]);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="error-container">
        <div className="error-title">Connection Error</div>
        <div>{error}</div>
        <button className="retry-btn" onClick={fetchQualityData}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '4px' }}>Data Quality</h1>
        <p style={{ color: 'var(--text-muted)' }}>Dataset validation, completeness, integrity and anomaly monitoring.</p>
      </div>

      {/* Overview Summary */}
      <div className="filter-card" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Overall Status: <StatusBadge status={data.overall_status} /></h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Missing Values</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.missing_values.reduce((sum, item) => sum + item.count, 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Duplicate IDs</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.duplicates.reduce((sum, item) => sum + item.count, 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Integrity Issues</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.referential_integrity.reduce((sum, item) => sum + item.orphan_count, 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Anomalies</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.anomalies.reduce((sum, item) => sum + item.count, 0)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Dataset Sheets */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Dataset Overview ({data.dataset.name})</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Sheet Name</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Rows</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Columns</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.sheets).map(([sheet, info]) => (
                <tr key={sheet} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{sheet}</td>
                  <td style={{ padding: '12px 16px' }}>{info.rows.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>{info.columns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Missing Values */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Missing Values</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Sheet</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Column</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Missing Count</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.missing_values.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No missing values detected.</td></tr>
              ) : (
                data.missing_values.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>{item.sheet}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.column}</td>
                    <td style={{ padding: '12px 16px' }}>{item.count}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={item.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Duplicates */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Duplicate Primary IDs</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Sheet</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Identifier</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Duplicates</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.duplicates.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px' }}>{item.sheet}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.id_column}</td>
                  <td style={{ padding: '12px 16px' }}>{item.count}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Referential Integrity */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Referential Integrity</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Relationship</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Orphan Count</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.referential_integrity.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.relationship}</td>
                  <td style={{ padding: '12px 16px' }}>{item.orphan_count}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Anomalies */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', gridColumn: '1 / -1' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Data Anomalies</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Sheet</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Field</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Anomaly Description</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Count</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.anomalies.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No documented anomalies detected.</td></tr>
              ) : (
                data.anomalies.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>{item.sheet}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.field}</td>
                    <td style={{ padding: '12px 16px' }}>{item.explanation}</td>
                    <td style={{ padding: '12px 16px' }}>{item.count}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={item.status} /></td>
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

export default DataQuality;
