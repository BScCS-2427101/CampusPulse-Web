import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getPractical15 } from '../services/api';
import ChartCard from '../components/ChartCard';
import LoadingState from '../components/LoadingState';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

const Practical15 = () => {
  const { globalCacheTimestamp } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    program: 'All',
    course: 'All',
    year: 'All',
    sem: 'All'
  });

  const fetchData = async (currentFilters = filters) => {
    try {
      setIsFiltering(true);
      setError(null);
      const result = await getPractical15(currentFilters);
      setData(result);
    } catch (err) {
      setError('Unable to load Practical 15 data.');
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
    const reset = { program: 'All', course: 'All', year: 'All', sem: 'All' };
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

  const renderForecastInfo = (forecast) => {
    if (!forecast) return "Forecast unavailable insufficient historical periods.";
    return `Method: ${forecast.method} | Horizon: ${forecast.horizon} periods | Estimates only.`;
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '4px' }}>Practical 15 — Historical Trends & Forecasting</h1>
        <p style={{ color: 'var(--text-muted)' }}>Analysis of historical academic trends, enrollment patterns and future enrollment estimates.</p>
      </div>

      <div className="filter-card" style={{ backgroundColor: 'var(--card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Program:</label>
          <select name="program" value={filters.program} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', maxWidth: '150px' }}>
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
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Year:</label>
          <select name="year" value={filters.year} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filter_options?.years?.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Semester:</label>
          <select name="sem" value={filters.sem} onChange={handleFilterChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filter_options?.sems?.map(s => <option key={s} value={s}>{s}</option>)}
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
          
          {/* 1. Enrollment Trend */}
          <ChartCard title="Historical Enrollment Trend">
            {charts.enrollment_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.enrollment_trend} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" angle={-30} textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="linear" dataKey="count" name="Number of Enrollments" stroke="var(--primary-color)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="no-data">Insufficient historical periods.</div>}
          </ChartCard>

          {/* 2. Assessment Score Trend */}
          <ChartCard title="Assessment Score Trend">
            {charts.assessment_score_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.assessment_score_trend} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" angle={-30} textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="linear" dataKey="score" name="Avg Score" stroke="var(--primary-color)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="no-data">Insufficient historical periods.</div>}
          </ChartCard>

          {/* 3. Pass Percentage Trend */}
          <ChartCard title="Pass Percentage Trend">
            {charts.pass_percentage_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.pass_percentage_trend} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" angle={-30} textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="linear" dataKey="pass_percent" name="Pass %" stroke="var(--primary-color)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="no-data">Insufficient historical periods.</div>}
          </ChartCard>

          {/* 4. Attendance Trend */}
          <ChartCard title="Attendance Trend">
            {charts.attendance_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.attendance_trend} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" angle={-30} textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="linear" dataKey="attendance" name="Avg Attendance %" stroke="var(--text-muted)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="no-data">Insufficient historical periods.</div>}
          </ChartCard>

          {/* 5. Credits Earned Trend */}
          <ChartCard title="Credits Earned Trend">
            {charts.credits_earned_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.credits_earned_trend} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" angle={-30} textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="linear" dataKey="credits" name="Total Credits Earned" stroke="#FF8F00" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="no-data">Insufficient historical periods.</div>}
          </ChartCard>
          
          {/* 6. Enrollment by Program */}
          <ChartCard title="Enrollment by Program">
            {charts.enrollment_by_program?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.enrollment_by_program} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="program" angle={-30} textAnchor="end" tick={{ fontSize: 8 }} interval={0} />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" name="Enrollments" fill="var(--primary-color)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 7. Enrollment by Course */}
          <ChartCard title="Enrollment by Course">
            {charts.enrollment_by_course?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.enrollment_by_course} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="course" tick={{ fontSize: 8 }} width={120} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" name="Enrollments" fill="var(--text-muted)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 8. Monthly Enrollment */}
          <ChartCard title="Monthly Enrollment Pattern">
            {charts.monthly_enrollment?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthly_enrollment} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" angle={-45} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" name="Total Enrollments" fill="var(--primary-color)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No Data</div>}
          </ChartCard>

          {/* 9. Enrollment Forecast */}
          <ChartCard title="Enrollment Forecast">
            {charts.enrollment_forecast ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '20px' }}>
                  {renderForecastInfo(charts.enrollment_forecast)}
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.enrollment_forecast.data} margin={{ bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="period" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} interval={0} />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend verticalAlign="top" height={36}/>
                    <Line type="linear" dataKey="historical" name="Historical" stroke="var(--primary-color)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={true} />
                    <Line type="linear" dataKey="forecast" name="Forecast" stroke="#FF8F00" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#FF8F00' }} connectNulls={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="no-data">Forecast unavailable insufficient historical periods.</div>}
          </ChartCard>

        </div>
      )}
    </div>
  );
};

export default Practical15;
