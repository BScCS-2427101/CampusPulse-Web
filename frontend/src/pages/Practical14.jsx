import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getPractical14 } from '../services/api';
import ChartCard from '../components/ChartCard';
import LoadingState from '../components/LoadingState';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, Cell, PieChart, Pie
} from 'recharts';

const COLORS = ['#2E7D32', '#757575', '#FF8F00', '#1976D2', '#D32F2F', '#7B1FA2'];

const Practical14 = () => {
  const { globalCacheTimestamp } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    program: 'All',
    risk: 'All',
    year: 'All',
    res: 'All',
    schol: 'All'
  });

  const fetchData = async (currentFilters = filters) => {
    try {
      setIsFiltering(true);
      setError(null);
      const result = await getPractical14(currentFilters);
      setData(result);
    } catch (err) {
      setError('Unable to load Practical 14 data.');
    } finally {
      setIsFiltering(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [globalCacheTimestamp]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchData(filters);
  };

  const resetFilters = () => {
    const reset = { program: 'All', risk: 'All', year: 'All', res: 'All', schol: 'All' };
    setFilters(reset);
    fetchData(reset);
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="error-container">
        <div className="error-title">Connection Error</div>
        <div>{error}</div>
        <button className="retry-btn" onClick={() => fetchData()}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const { filter_options, charts } = data;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '4px' }}>Practical 14 — Student Segmentation & Behaviour Analysis</h1>
        <p style={{ color: 'var(--text-muted)' }}>Analysis of student risk, residency, scholarship status and learning behaviour.</p>
      </div>

      <div className="filter-card" style={{ backgroundColor: 'var(--card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Program:</label>
          <select name="program" value={filters.program} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', maxWidth: '150px' }}>
            {filter_options?.programs?.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Risk Level:</label>
          <select name="risk" value={filters.risk} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filter_options?.risks?.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Year:</label>
          <select name="year" value={filters.year} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filter_options?.years?.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Residency:</label>
          <select name="res" value={filters.res} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filter_options?.residencies?.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Scholarship:</label>
          <select name="schol" value={filters.schol} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filter_options?.scholarships?.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <button onClick={applyFilters} style={{ padding: '8px 16px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
          Apply Filters
        </button>
        <button onClick={resetFilters} style={{ padding: '8px 16px', backgroundColor: '#e0e0e0', color: 'var(--text-main)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
          Clear Filters
        </button>

        {isFiltering && <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>Loading...</span>}
      </div>

      {Object.keys(charts).length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No data available for the selected filters.</div>
      ) : (
        <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          
          {/* 1. Academic Risk Distribution */}
          <ChartCard title="Academic Risk Distribution">
            {charts.risk_distribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.risk_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="risk_level" />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" name="Number of Students" fill="var(--primary-color)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 2. Residency Distribution */}
          <ChartCard title="Residency Distribution">
            {charts.residency_distribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.residency_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="residency" />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" name="Number of Students" fill="var(--text-muted)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 3. Scholarship Distribution */}
          <ChartCard title="Scholarship Distribution">
            {charts.scholarship_distribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.scholarship_distribution} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="scholarship" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" name="Number of Students">
                    {charts.scholarship_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.scholarship === 'Not Specified' ? '#FF8F00' : 'var(--primary-color)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 4. Engagement by Risk Level */}
          <ChartCard title="Engagement by Risk Level">
            {charts.engagement_by_risk?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.engagement_by_risk}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="academic_risk_level" />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="engagement_score" name="Avg Engagement Score" fill="var(--text-muted)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 5. LMS Logins vs Assessment Score */}
          <ChartCard title="LMS Logins vs Assessment Score">
            {charts.lms_vs_score?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="lms_logins" name="LMS Logins" />
                  <YAxis type="number" dataKey="assessment_score" name="Score" domain={[0, 100]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={charts.lms_vs_score} fill="var(--primary-color)" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 6. Library Visits vs Assessment Score */}
          <ChartCard title="Library Visits vs Assessment Score">
            {charts.library_vs_score?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="library_visits" name="Library Visits" />
                  <YAxis type="number" dataKey="assessment_score" name="Score" domain={[0, 100]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={charts.library_vs_score} fill="var(--text-muted)" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 7. Video Learning vs Assessment Score */}
          <ChartCard title="Video Learning vs Assessment Score">
            {charts.video_vs_score?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="video_minutes" name="Video Mins" />
                  <YAxis type="number" dataKey="assessment_score" name="Score" domain={[0, 100]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={charts.video_vs_score} fill="var(--primary-color)" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>
          
          {/* 8. Study Hours by Segment */}
          <ChartCard title="Study Hours Segmentation">
            {charts.study_hours_segment?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.study_hours_segment}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" name="Number of Enrollments" fill="var(--text-muted)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 9. Attendance vs Assignment Completion */}
          <ChartCard title="Attendance vs Assignment Completion">
            {charts.attendance_vs_assignment?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="attendance_percentage" name="Attendance %" domain={[0, 100]} />
                  <YAxis type="number" dataKey="assignment_completion_rate" name="Completion %" domain={[0, 100]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={charts.attendance_vs_assignment} fill="var(--primary-color)" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

        </div>
      )}
    </div>
  );
};

export default Practical14;
