import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getDashboard } from '../services/api';
import KpiCard from '../components/KpiCard';
import ChartCard from '../components/ChartCard';
import LoadingState from '../components/LoadingState';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line 
} from 'recharts';

const Dashboard = () => {
  const { globalCacheTimestamp } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDashboard();
      setData(result);
    } catch (err) {
      setError('Unable to connect to CampusPulse backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [globalCacheTimestamp]);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="error-container">
        <div className="error-title">Connection Error</div>
        <div>{error}</div>
        <button className="retry-btn" onClick={fetchDashboardData}>Retry Connection</button>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, charts } = data;

  return (
    <div>
      <div style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
        Data Source: LIVE DATA (Connected) | Last Updated: {data.last_updated}
      </div>

      <div className="kpi-grid">
        <KpiCard title="Total Students" value={kpis.total_students} />
        <KpiCard title="Programs" value={kpis.programs} />
        <KpiCard title="Courses" value={kpis.courses} />
        <KpiCard title="Enrollments" value={kpis.enrollments} />
        <KpiCard title="Avg Score" value={kpis.avg_score?.toFixed(1)} />
        <KpiCard title="Avg Attendance" value={`${kpis.avg_attendance?.toFixed(1)}%`} />
        <KpiCard title="Pass %" value={`${kpis.pass_percentage?.toFixed(1)}%`} />
        <KpiCard title="Academic Risk Count" value={kpis.academic_risk_count} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Avg Assessment Score by Program">
          {charts?.avg_score_by_program?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.avg_score_by_program}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="program_name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="avg_assessment_score" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>No Data</div>
          )}
        </ChartCard>

        <ChartCard title="Attendance vs Assessment Score">
          {charts?.attendance_vs_score?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="attendance_percentage" name="Attendance %" domain={[0, 100]} />
                <YAxis type="number" dataKey="assessment_score" name="Score" domain={[0, 100]} />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={charts.attendance_vs_score} fill="var(--primary-light)" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>No Data</div>
          )}
        </ChartCard>

        <ChartCard title="Grade Distribution">
          {charts?.grade_distribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.grade_distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="grade" />
                <YAxis />
                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="var(--text-muted)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>No Data</div>
          )}
        </ChartCard>

        <ChartCard title="Enrollment Trend">
           {charts?.enrollment_trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.enrollment_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="enrollment_count" stroke="var(--primary-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
           ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>No Data</div>
           )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
