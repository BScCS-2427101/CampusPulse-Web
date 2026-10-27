import React from 'react';
import { 
  User, Award, Layers, Database, BarChart3, Activity, 
  ShieldAlert, Download, Terminal, Lightbulb, BookOpen, 
  Cpu, FileCheck2, Compass, AlertCircle
} from 'lucide-react';

const About = () => {
  return (
    <div style={{ padding: '8px 4px 48px 4px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
        color: '#ffffff',
        padding: '36px 32px',
        borderRadius: '12px',
        marginBottom: '32px',
        boxShadow: '0 8px 24px rgba(46, 125, 50, 0.15)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '16px',
          backdropFilter: 'blur(4px)'
        }}>
          <Award size={16} /> Academic Capstone Project
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: 1.2, margin: '0 0 12px 0' }}>
          CampusPulse
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.95, margin: '0 0 24px 0', fontWeight: '400' }}>
          Live Academic Analytics, Visualization & Storytelling System
        </p>
        
        {/* Author Details Card */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          padding: '16px 20px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} color="#A5D6A7" />
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Developer</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700' }}>RAJDEEP M PARAB</div>
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} className="hide-mobile"></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} color="#FFE082" />
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Roll Number</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700' }}>T101</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Project Overview */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <BookOpen size={22} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>Project Overview</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
            <strong>CampusPulse</strong> is a full-stack educational data analytics platform built to examine student performance, attendance patterns, behavioral engagement, historical trends, enrollment forecasting, and simulated real-time data flow. Designed as an academic capstone, it combines analytical rigour with an intuitive, responsive web presentation system.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <AlertCircle size={22} color="#D32F2F" />
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>Problem Statement</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
            Higher education data is frequently partitioned across disparate spreadsheets and portals. Institutions struggle to detect early signs of academic risk, monitor live activity trends, and synthesize analytical findings into clear pedagogical narratives for stakeholders without depending on cumbersome local software.
          </p>
        </div>

        {/* Core Objectives */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Compass size={22} color="#1976D2" />
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>Key Objectives</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>
            <li>Integrate and audit multi-table academic records across 5 core relational dimensions.</li>
            <li>Identify academic risk early through student segmentation and engagement scoring.</li>
            <li>Model historical enrollment cycles and provide hybrid predictive forecasting.</li>
            <li>Deliver an interactive, guided 8-stage storytelling mode for presentation.</li>
            <li>Demonstrate dynamic live state mutation and reliable baseline restoration.</li>
          </ul>
        </div>

      </div>

      {/* Dataset & Persistence Architecture */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Database size={24} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-main)' }}>Dataset & Persistence Architecture</h2>
        </div>
        
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
          The system operates over an authoritative academic sample dataset containing 100 records per worksheet, representing five interconnected relational dimensions:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#F8F9FA', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-color)', marginBottom: '4px' }}>1. Students</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>100 rows • Demographic, residency, scholarship status & risk profile.</div>
          </div>
          <div style={{ backgroundColor: '#F8F9FA', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-color)', marginBottom: '4px' }}>2. Programs</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>100 rows • Degree levels, faculty counts, capacity & accreditation.</div>
          </div>
          <div style={{ backgroundColor: '#F8F9FA', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-color)', marginBottom: '4px' }}>3. Courses</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>100 rows • Course difficulty, credits, passing marks & prerequisites.</div>
          </div>
          <div style={{ backgroundColor: '#F8F9FA', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-color)', marginBottom: '4px' }}>4. Enrollments</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>100 rows • Grades, marks, attendance, completion & credits.</div>
          </div>
          <div style={{ backgroundColor: '#F8F9FA', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-color)', marginBottom: '4px' }}>5. Learning Activity</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>100 rows • Study hours, LMS logins, library visits & video minutes.</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9', padding: '18px 20px', borderRadius: '8px', color: '#1B5E20', fontSize: '0.92rem', lineHeight: '1.6' }}>
          <strong>Immutable Baseline vs. Live Working Dataset:</strong>
          <br />
          The original workbook (<code>CampusPulse_Academic_Dataset_Original.xlsx</code>) is strictly read-only and packaged within the deployment as the permanent baseline. All simulation updates occur exclusively on an isolated working copy (<code>CampusPulse_Live_Data.xlsx</code>) using atomic file replacement and thread locking. At any time, an authorized administrator can trigger a reset that restores the working dataset from the authoritative original baseline.
        </div>
      </div>

      {/* Practical Implementations */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <BarChart3 size={24} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-main)' }}>Analytical Practicals Overview</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderLeft: '4px solid var(--primary-color)', paddingLeft: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px 0', color: 'var(--text-main)' }}>
              Practical 13 — Academic Performance Analytics
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Deep academic evaluation exploring assessment score distributions by program, pass rates by course (evaluated against course pass marks and result statuses), longitudinal score trends, attendance correlation, study hours scatter plots, semester heatmaps, and credit comparisons.
            </p>
          </div>

          <div style={{ borderLeft: '4px solid #1976D2', paddingLeft: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px 0', color: 'var(--text-main)' }}>
              Practical 14 — Student Behaviour & Risk Analytics
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Multi-dimensional segmentation classifying students into academic risk cohorts (Low, Medium, High). Examines residency dynamics, scholarship allocations, engagement scores, digital interactions (LMS logins, video learning minutes, library visits), and study hour quartile segmentation.
            </p>
          </div>

          <div style={{ borderLeft: '4px solid #FF8F00', paddingLeft: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px 0', color: 'var(--text-main)' }}>
              Practical 15 — Historical Trends & Forecasting
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Chronological time-series tracking enrollment volumes, pass percentages, average scores, and credit completions across academic periods. Features hybrid predictive modeling (Linear Regression / Simple Moving Average) projecting future enrollment demand over a 3-period horizon.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Features Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Storytelling System */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Layers size={22} color="var(--primary-color)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)' }}>Storytelling System</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
            An 8-stage guided walkthrough translating raw statistical tables into a structured presentation narrative. Includes keyboard navigation, stage progression indicators, presentation mode for projectors, and actionable pedagogical conclusions.
          </p>
        </div>

        {/* Data Quality Engine */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShieldAlert size={22} color="#D32F2F" />
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)' }}>Data Quality Engine</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
            Continuous dataset vigilance auditing duplicate identifiers, referential integrity between foreign keys, documented missing attributes (such as optional scholarships and prerequisites), and credit anomalies (credits earned exceeding attempted).
          </p>
        </div>

        {/* Live Simulation Engine */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Activity size={22} color="#FF8F00" />
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)' }}>Live Simulation Engine</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
            Controlled administrative mechanics mimicking live university database operations. Allows step-by-step or automated updates to grades, attendance, and activity logs with an event audit log and instantaneous UI reactivity.
          </p>
        </div>

        {/* Export Centre */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Download size={22} color="#1976D2" />
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)' }}>Export Centre</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
            Multi-format extract capabilities supporting visual exports (high-resolution PNG and structured multi-page PDF documents) and data exports (Excel .xlsx and CSV ZIP archives) generated directly from the live state.
          </p>
        </div>

      </div>

      {/* Verified Technology Stack */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Cpu size={24} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-main)' }}>Verified Technology Stack</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <strong>Frontend Framework:</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>React 18 & Vite (SPA)</div>
          </div>
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <strong>Charting & Icons:</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Recharts & Lucide React</div>
          </div>
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <strong>Backend Framework:</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>FastAPI & Python 3.11+</div>
          </div>
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <strong>Data Processing:</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Pandas, NumPy, OpenPyXL</div>
          </div>
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <strong>Frontend Deployment:</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Vercel Web Hosting</div>
          </div>
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <strong>Backend Deployment:</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Render Web Service</div>
          </div>
        </div>
      </div>

      {/* Assumptions & Limitations */}
      <div className="card" style={{ padding: '28px', backgroundColor: '#FFFDF5', border: '1px solid #FFE082' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Lightbulb size={24} color="#F57F17" />
          <h2 style={{ fontSize: '1.3rem', margin: 0, color: '#E65100' }}>Assumptions & Limitations</h2>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#5D4037', fontSize: '0.92rem', lineHeight: '1.6' }}>
          <li>
            <strong>Academic Sample Data:</strong> The dataset is curated for demonstration and capstone evaluation; it does not connect to live institutional administrative databases or student records systems.
          </li>
          <li>
            <strong>Forecast Boundaries:</strong> Forecasting utilizes mathematical extrapolations (Linear Regression and 2-period moving averages) assuming historical continuity; external economic or demographic shocks are not modeled.
          </li>
          <li>
            <strong>Data Anomalies Preserved:</strong> 29 records with credits earned exceeding credits attempted and missing scholarship entries are preserved deliberately as historical anomalies for data quality audit demonstration.
          </li>
          <li>
            <strong>Simulation Concurrency:</strong> Live updates utilize thread-safe file locks and atomic swap operations to prevent workbook corruption across concurrent HTTP requests.
          </li>
        </ul>
      </div>

    </div>
  );
};

export default About;
