import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getPractical13 } from '../services/api';
import ChartCard from '../components/ChartCard';
import LoadingState from '../components/LoadingState';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, LineChart, Line, Cell
} from 'recharts';

const Practical13 = () => {
  const { globalCacheTimestamp } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    program: 'All',
    course: 'All',
    semester: 'All',
    year: 'All'
  });

  const fetchData = async (currentFilters = filters) => {
    try {
      setIsFiltering(true);
      setError(null);
      const result = await getPractical13(currentFilters);
      setData(result);
    } catch (err) {
      setError('Unable to load Practical 13 data.');
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
    const reset = { program: 'All', course: 'All', semester: 'All', year: 'All' };
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

  const { filter_options, charts, anomalies } = data;

  // Custom Heatmap implementation
  const Heatmap = ({ data }) => {
    if (!data || data.length === 0) return <div className="no-data">No Data</div>;
    
    // get unique courses and semesters
    const courses = [...new Set(data.map(d => d.course_name))];
    const semesters = [...new Set(data.map(d => d.semester))].sort();

    return (
      <div style={{ overflowX: 'auto', height: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>Course</th>
              {semesters.map(sem => <th key={sem} style={{ padding: '8px', borderBottom: '2px solid var(--border-color)' }}>{sem}</th>)}
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course}>
                <td style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: '500' }}>
                  {course.length > 20 ? course.substring(0, 20) + '...' : course}
                </td>
                {semesters.map(sem => {
                  const cell = data.find(d => d.course_name === course && d.semester === sem);
                  const score = cell ? cell.score : null;
                  let bg = 'transparent';
                  if (score !== null) {
                    // map 0-100 to green opacity
                    const opacity = Math.max(0.1, score / 100);
                    bg = `rgba(46, 125, 50, ${opacity})`;
                  }
                  return (
                    <td key={sem} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', backgroundColor: bg, color: score > 60 ? '#fff' : 'inherit' }}>
                      {score !== null ? score.toFixed(1) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '4px' }}>Practical 13 — Academic Performance Analysis</h1>
        <p style={{ color: 'var(--text-muted)' }}>Interactive analysis of academic achievement, attendance and learning performance.</p>
      </div>

      <div className="filter-card" style={{ backgroundColor: 'var(--card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Program:</label>
          <select name="program" value={filters.program} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filter_options?.programs?.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Course:</label>
          <select name="course" value={filters.course} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filter_options?.courses?.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Semester:</label>
          <select name="semester" value={filters.semester} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filter_options?.semesters?.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Academic Year:</label>
          <select name="year" value={filters.year} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filter_options?.years?.map(y => <option key={y} value={y}>{y}</option>)}
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

      {anomalies > 0 && (
        <div style={{ padding: '12px 16px', backgroundColor: '#FFF3E0', border: '1px solid #FFE0B2', color: '#E65100', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem' }}>
          <strong>Data Quality Notice:</strong> {anomalies} enrollment records contain credits earned greater than credits attempted. These records are retained as provided in the source dataset.
        </div>
      )}

      {Object.keys(charts).length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No data available for the selected filters.</div>
      ) : (
        <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          
          {/* 1. Avg Assessment Score by Program */}
          <ChartCard title="Avg Assessment Score by Program">
            {charts.avg_score_by_program?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.avg_score_by_program} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="program_name" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="assessment_score" name="Avg Score" fill="var(--primary-color)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 2. Pass Percentage by Course */}
          <ChartCard title="Pass Percentage by Course">
            {charts.pass_pct_by_course?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.pass_pct_by_course} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="course_name" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="pass_percentage" name="Pass %" fill="var(--primary-light)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 3. Assessment Score Trend */}
          <ChartCard title="Assessment Score Trend">
            {charts.score_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.score_trend} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="assessment_score" name="Avg Score" stroke="var(--primary-dark)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="no-data">Insufficient periods for trend</div>}
          </ChartCard>

          {/* 4. Attendance by Program */}
          <ChartCard title="Attendance by Program">
            {charts.attendance_by_program?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.attendance_by_program} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="program_name" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="attendance_percentage" name="Attendance %" fill="var(--primary-color)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 5. Attendance vs Assessment Score */}
          <ChartCard title="Attendance vs Assessment Score">
            {charts.attendance_vs_score?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="attendance_percentage" name="Attendance %" domain={[0, 100]} />
                  <YAxis type="number" dataKey="assessment_score" name="Score" domain={[0, 100]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={charts.attendance_vs_score} fill="var(--primary-color)" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 6. Study Hours vs Assessment Score */}
          <ChartCard title="Study Hours vs Assessment Score">
            {charts.study_hours_vs_score?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="study_hours" name="Study Hours" />
                  <YAxis type="number" dataKey="assessment_score" name="Score" domain={[0, 100]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={charts.study_hours_vs_score} fill="var(--primary-light)" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 7. Course/Semester Heatmap */}
          <ChartCard title="Course/Semester Heatmap">
            <Heatmap data={charts.heatmap} />
          </ChartCard>

          {/* 8. Grade Distribution */}
          <ChartCard title="Grade Distribution">
            {charts.grade_distribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.grade_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" name="Count" fill="var(--text-muted)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 9. Credits Attempted vs Earned */}
          <ChartCard title="Credits Attempted vs Earned by Program">
            {charts.credits_comparison?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.credits_comparison} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="program_name" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="credits_attempted" name="Attempted" fill="var(--text-muted)" />
                  <Bar dataKey="credits_earned" name="Earned" fill="var(--primary-color)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

        </div>
      )}
    </div>
  );
};

export default Practical13;
