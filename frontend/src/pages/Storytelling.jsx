import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getDashboard, getPractical13, getPractical14, getPractical15, getDataQuality } from '../services/api';
import LoadingState from '../components/LoadingState';
import ChartCard from '../components/ChartCard';
import KpiCard from '../components/KpiCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#2E7D32', '#757575', '#FF8F00', '#1976D2', '#D32F2F', '#7B1FA2'];

const Storytelling = ({ forceStage = null }) => {
  const { globalCacheTimestamp } = useOutletContext();
  const [stage, setStage] = useState(forceStage !== null ? forceStage : 0);
  const [presentationMode, setPresentationMode] = useState(false);
  
  const [dashboardData, setDashboardData] = useState(null);
  const [p13Data, setP13Data] = useState(null);
  const [p14Data, setP14Data] = useState(null);
  const [p15Data, setP15Data] = useState(null);
  const [qualityData, setQualityData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (forceStage !== null) {
      setStage(forceStage);
    }
  }, [forceStage]);

  const stages = [
    "Campus Overview",
    "Academic Performance",
    "Learning Behaviour",
    "Student Risk Segmentation",
    "Student Analytical Insights",
    "Historical Trends",
    "Forecasting",
    "Insights & Actions"
  ];

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dData, p13, p14, p15, qData] = await Promise.all([
        getDashboard(),
        getPractical13(),
        getPractical14(),
        getPractical15(),
        getDataQuality()
      ]);
      
      setDashboardData(dData);
      setP13Data(p13);
      setP14Data(p14);
      setP15Data(p15);
      setQualityData(qData);
    } catch (err) {
      setError('Unable to load presentation data. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [globalCacheTimestamp, fetchAllData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Home') goFirst();
      else if (e.key === 'End') goLast();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const goNext = () => setStage(s => Math.min(s + 1, stages.length - 1));
  const goPrev = () => setStage(s => Math.max(s - 1, 0));
  const goFirst = () => setStage(0);
  const goLast = () => setStage(stages.length - 1);

  const togglePresentationMode = () => {
    setPresentationMode(prev => !prev);
  };

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    const header = document.querySelector('.header');
    if (presentationMode) {
      if (sidebar) sidebar.style.display = 'none';
      if (header) header.style.display = 'none';
      document.body.style.overflow = 'auto'; // allow scrolling within presentation
    } else {
      if (sidebar) sidebar.style.display = 'flex';
      if (header) header.style.display = 'flex';
    }
    
    // Cleanup in case component unmounts while in presentation mode
    return () => {
      if (sidebar) sidebar.style.display = 'flex';
      if (header) header.style.display = 'flex';
    };
  }, [presentationMode]);

  if (loading && !dashboardData) return <LoadingState />;

  if (error) {
    return (
      <div className="error-container">
        <div className="error-title">Presentation Error</div>
        <div>{error}</div>
        <button className="retry-btn" onClick={fetchAllData}>Retry</button>
      </div>
    );
  }
  
  if (!dashboardData || !p13Data || !p14Data || !p15Data || !qualityData) return null;

  // --- Render Stage Content Helpers ---

  const renderStage1 = () => {
    const kpis = dashboardData.kpis || [];
    return (
      <div className="stage-content" style={{ animation: 'fadeIn 0.5s ease-in' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-main)' }}>1. Campus Overview</h2>
        <div style={{ backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '1.1rem' }}>
          <strong>Observation:</strong> The CampusPulse dataset contains a comprehensive snapshot of institutional metrics including program footprints, student enrollments, and baseline academic performance indicators.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {kpis.map((kpi, idx) => (
            <KpiCard key={idx} title={kpi.title} value={kpi.value} />
          ))}
        </div>
      </div>
    );
  };

  const renderStage2 = () => {
    const p13Charts = p13Data.charts || {};
    return (
      <div className="stage-content" style={{ animation: 'fadeIn 0.5s ease-in' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-main)' }}>2. Academic Performance</h2>
        <div style={{ backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '1.1rem' }}>
          <strong>Observation:</strong> Performance varies systematically across programs. The grade distribution indicates the central tendency of assessment outcomes.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {p13Charts.avg_score_by_program && (
            <ChartCard title="Avg Assessment Score by Program">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={p13Charts.avg_score_by_program.data} layout="vertical" margin={{ left: 80, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="program_name" type="category" width={80} tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Bar dataKey="avg_score" fill="#2E7D32" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
          {p13Charts.grade_distribution && (
            <ChartCard title="Grade Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={p13Charts.grade_distribution.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#757575" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      </div>
    );
  };

  const renderStage3 = () => {
    const p14Charts = p14Data.charts || {};
    const p13Charts = p13Data.charts || {};
    return (
      <div className="stage-content" style={{ animation: 'fadeIn 0.5s ease-in' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-main)' }}>3. Learning Behaviour</h2>
        <div style={{ backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '1.1rem' }}>
          <strong>Observation:</strong> Positive correlations exist between learning engagement (LMS Logins, Study Hours) and final assessment outcomes.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {p14Charts.study_hours_by_segment && (
            <ChartCard title="Study Hours Segmentation">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={p14Charts.study_hours_by_segment.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#1976D2" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
          {p13Charts.attendance_vs_score && (
            <ChartCard title="Attendance vs Assessment Score">
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="attendance_percentage" name="Attendance %" />
                  <YAxis type="number" dataKey="assessment_score" name="Score" />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={p13Charts.attendance_vs_score.data} fill="#FF8F00" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      </div>
    );
  };

  const renderStage4 = () => {
    const p14Charts = p14Data.charts || {};
    return (
      <div className="stage-content" style={{ animation: 'fadeIn 0.5s ease-in' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-main)' }}>4. Student Risk Segmentation</h2>
        <div style={{ backgroundColor: '#ffebee', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '1.1rem', color: '#c62828' }}>
          <strong>Observation:</strong> A subset of students are identified as High Risk based on combined academic, attendance, and behavioural profiles.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {p14Charts.risk_distribution && (
            <ChartCard title="Academic Risk Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={p14Charts.risk_distribution.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="risk_level" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#2E7D32" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
          {p14Charts.engagement_by_risk && (
            <ChartCard title="Engagement by Risk Level">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={p14Charts.engagement_by_risk.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="risk_level" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="avg_engagement" fill="#757575" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      </div>
    );
  };

  const renderStage5 = () => {
    const p14Charts = p14Data.charts || {};
    return (
      <div className="stage-content" style={{ animation: 'fadeIn 0.5s ease-in' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-main)' }}>5. Student Analytical Insights</h2>
        <div style={{ backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '1.1rem' }}>
          <strong>Observation:</strong> Additional demographic variables such as residency and scholarship status provide deeper context to the student population structure.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {p14Charts.residency_distribution && (
            <ChartCard title="Residency Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={p14Charts.residency_distribution.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="residency" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#1976D2" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
          {p14Charts.scholarship_distribution && (
            <ChartCard title="Scholarship Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={p14Charts.scholarship_distribution.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="scholarship_status" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#7B1FA2" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      </div>
    );
  };

  const renderStage6 = () => {
    const p15Charts = p15Data.charts || {};
    return (
      <div className="stage-content" style={{ animation: 'fadeIn 0.5s ease-in' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-main)' }}>6. Historical Trends</h2>
        <div style={{ backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '1.1rem' }}>
          <strong>Observation:</strong> Longitudinal data reveals cyclical patterns in enrollments and aggregated academic outcomes.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {p15Charts.enrollment_trend && (
            <ChartCard title="Enrollment Trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={p15Charts.enrollment_trend.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="count" stroke="#2E7D32" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
          {p15Charts.pass_percentage_trend && (
            <ChartCard title="Pass Percentage Trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={p15Charts.pass_percentage_trend.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="pass_pct" stroke="#FF8F00" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      </div>
    );
  };

  const renderStage7 = () => {
    const p15Charts = p15Data.charts || {};
    const forecast = p15Charts.enrollment_forecast;
    
    let methodDesc = "Forecast unavailable — insufficient historical periods.";
    if (forecast && forecast.method === "Simple Moving Average") {
      methodDesc = "Method: 2-period Simple Moving Average (SMA). Horizon: 3 periods.";
    } else if (forecast && forecast.method === "Linear Regression") {
      methodDesc = "Method: Linear Regression using numpy.polyfit. Horizon: 3 periods.";
    }

    return (
      <div className="stage-content" style={{ animation: 'fadeIn 0.5s ease-in' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-main)' }}>7. Forecasting</h2>
        <div style={{ backgroundColor: '#fff8e1', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '1.1rem', color: '#f57f17' }}>
          <strong>Hybrid Forecasting Methodology:</strong> {methodDesc}
          <div style={{ marginTop: '8px', fontSize: '0.9rem', fontStyle: 'italic' }}>Note: Forecast values are model-based estimates derived from available historical data and are not guaranteed.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {forecast && forecast.data.length > 0 ? (
            <ChartCard title="Enrollment Forecast">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={forecast.data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="historical" stroke="#2E7D32" strokeWidth={3} name="Historical" connectNulls />
                  <Line type="monotone" dataKey="forecast" stroke="#FF8F00" strokeWidth={3} strokeDasharray="5 5" name="Forecast" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              Insufficient historical data to generate forecast.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStage8 = () => {
    const kpis = dashboardData.kpis || [];
    const passPct = kpis.find(k => k.title === "Pass Percentage")?.value || "N/A";
    const attPct = kpis.find(k => k.title === "Average Attendance")?.value || "N/A";
    const p14Charts = p14Data.charts || {};
    const riskData = p14Charts.risk_distribution?.data || [];
    const highRisk = riskData.find(r => r.risk_level === 'High')?.count || 0;
    const anomalies = qualityData.anomalies.reduce((sum, a) => sum + a.count, 0);

    return (
      <div className="stage-content" style={{ animation: 'fadeIn 0.5s ease-in' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-main)' }}>8. Insights & Actions</h2>
        
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', color: 'var(--primary-color)' }}>Data Insights (Evidence)</h3>
          <ul style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--text-main)', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '12px' }}>Overall pass percentage stands at <strong>{passPct}</strong> with average attendance at <strong>{attPct}</strong>.</li>
            <li style={{ marginBottom: '12px' }}><strong>{highRisk}</strong> students are currently categorized as High Risk based on the multifactorial risk model.</li>
            <li style={{ marginBottom: '12px' }}>Positive correlation visually confirmed between LMS log-ins, library visits, and assessment outcomes.</li>
            <li style={{ marginBottom: '12px' }}>Data Quality Check: <strong>{anomalies}</strong> anomalies detected (e.g., credits earned exceeding attempted).</li>
          </ul>
        </div>

        <div className="card" style={{ padding: '24px', backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', color: '#2e7d32' }}>Suggested Actions</h3>
          <ul style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#1b5e20', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '12px' }}>Initiate early intervention protocols for the {highRisk} High Risk students identified.</li>
            <li style={{ marginBottom: '12px' }}>Review academic support allocation for programs exhibiting below-average pass percentages.</li>
            <li style={{ marginBottom: '12px' }}>Investigate the {anomalies} flagged data anomalies to ensure reporting accuracy.</li>
            <li style={{ marginBottom: '12px' }}>Monitor upcoming enrollment forecasts and adjust capacity planning accordingly.</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderCurrentStage = () => {
    switch (stage) {
      case 0: return renderStage1();
      case 1: return renderStage2();
      case 2: return renderStage3();
      case 3: return renderStage4();
      case 4: return renderStage5();
      case 5: return renderStage6();
      case 6: return renderStage7();
      case 7: return renderStage8();
      default: return null;
    }
  };

  const progressPercent = ((stage + 1) / stages.length) * 100;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: presentationMode ? '100vh' : '100%',
      backgroundColor: presentationMode ? '#ffffff' : 'transparent',
      padding: presentationMode ? '20px 60px' : '0',
      boxSizing: 'border-box',
      position: presentationMode ? 'fixed' : 'relative',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: presentationMode ? 9999 : 1
    }}>
      
      {/* Top Navigation Bar */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '24px', backgroundColor: 'var(--card-bg)', 
        padding: '16px 24px', borderRadius: presentationMode ? '0' : '8px',
        borderBottom: presentationMode ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
        boxShadow: presentationMode ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={goFirst} disabled={stage === 0} style={navBtnStyle(stage === 0)}>First</button>
          <button onClick={goPrev} disabled={stage === 0} style={navBtnStyle(stage === 0)}>Previous</button>
        </div>
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>STAGE {stage + 1} OF {stages.length}</div>
          <div style={{ fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{stages[stage]}</div>
          <div style={{ width: '200px', height: '4px', backgroundColor: '#e0e0e0', margin: '8px auto 0 auto', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={goNext} disabled={stage === stages.length - 1} style={navBtnStyle(stage === stages.length - 1)}>Next</button>
          <button onClick={goLast} disabled={stage === stages.length - 1} style={navBtnStyle(stage === stages.length - 1)}>Last</button>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 8px' }}></div>
          
          <button onClick={togglePresentationMode} style={{
            padding: '8px 16px', backgroundColor: presentationMode ? '#d32f2f' : '#FF8F00',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
          }}>
            {presentationMode ? 'Exit Presentation' : 'Start Presentation'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: presentationMode ? '20px 0' : '0' }}>
        <div style={{ maxWidth: presentationMode ? '1200px' : '100%', margin: '0 auto' }}>
          {renderCurrentStage()}
        </div>
      </div>

    </div>
  );
};

const navBtnStyle = (disabled) => ({
  padding: '8px 16px',
  backgroundColor: disabled ? '#f5f5f5' : 'var(--primary-color)',
  color: disabled ? '#bdbdbd' : 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontWeight: '500',
  transition: 'background-color 0.2s'
});

export default Storytelling;
