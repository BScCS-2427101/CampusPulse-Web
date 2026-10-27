import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useOutletContext, MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';

import Dashboard from './Dashboard';
import Practical13 from './Practical13';
import Practical14 from './Practical14';
import Practical15 from './Practical15';
import DataQuality from './DataQuality';
import Storytelling from './Storytelling';

const MockRouter = ({ children, context }) => (
  <MemoryRouter initialEntries={['/']}>
    <Routes>
      <Route element={<Outlet context={context} />}>
        <Route path="/" element={children} />
      </Route>
    </Routes>
  </MemoryRouter>
);

const STORY_STAGES = [
  "Stage 1: Introduction & Dataset Scope",
  "Stage 2: Academic Performance",
  "Stage 3: Attendance & Learning Behaviour",
  "Stage 4: Student Risk Segmentation",
  "Stage 5: Demographic & Student Segmentation",
  "Stage 6: Historical Trends",
  "Stage 7: Predictive Forecasting",
  "Stage 8: Evidence-Supported Conclusions & Actions"
];

const Exports = () => {
  const { globalCacheTimestamp, setGlobalCacheTimestamp } = useOutletContext();
  const [loadingMsg, setLoadingMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const hiddenContainerRef = useRef(null);
  const [exportTarget, setExportTarget] = useState(null);
  const [storyStage, setStoryStage] = useState(0);
  const [selectedStoryStage, setSelectedStoryStage] = useState(0);

  const getTimestampStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
  };

  const handleStructuredExport = (type, format) => {
    if (loadingMsg) return;
    setLoadingMsg(`Generating ${format.toUpperCase()} dataset for ${type}...`);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    const ts = getTimestampStr();
    const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const url = `${baseUrl}/exports/${type}?format=${format}&_t=${globalCacheTimestamp || Date.now()}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `CampusPulse_${type}_${ts}.${format}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      setLoadingMsg(null);
      setSuccessMsg(`Successfully initiated ${format.toUpperCase()} download for ${type}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1000);
  };

  // Resolves SVG CSS custom properties (var(--...)) to concrete hex colors for clean canvas rasterization
  const inlineSvgStyles = (rootElement) => {
    if (!rootElement) return;
    const svgElements = rootElement.querySelectorAll('svg, svg *');
    svgElements.forEach(el => {
      try {
        ['fill', 'stroke', 'stop-color'].forEach(prop => {
          const val = el.getAttribute(prop);
          if (val && val.includes('var(')) {
            if (val.includes('--primary-color')) el.setAttribute(prop, '#2E7D32');
            else if (val.includes('--primary-light')) el.setAttribute(prop, '#4CAF50');
            else if (val.includes('--primary-dark')) el.setAttribute(prop, '#1B5E20');
            else if (val.includes('--text-main')) el.setAttribute(prop, '#333333');
            else if (val.includes('--text-muted')) el.setAttribute(prop, '#757575');
            else if (val.includes('--danger')) el.setAttribute(prop, '#D32F2F');
            else el.setAttribute(prop, '#2E7D32');
          }
        });
        if (el.style) {
          if (el.style.fill && el.style.fill.includes('var(')) el.style.fill = '#2E7D32';
          if (el.style.stroke && el.style.stroke.includes('var(')) el.style.stroke = '#2E7D32';
        }
      } catch (e) {
        // Safe fallback
      }
    });
  };

  // Deterministically wait until loading spinners are gone, data is rendered, and Recharts animations settle
  const waitForContentReady = async (container, timeoutMs = 20000) => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (container && container.children && container.children.length > 0) {
        const hasSpinner = container.querySelector('.loading-container, .spinner') !== null;
        const hasError = container.querySelector('.error-container') !== null;
        const hasContent = container.querySelector('.kpi-grid, .charts-grid, table, .recharts-surface, .story-card, .dataset-table, .card') !== null;
        
        if (hasError) {
          throw new Error("Target visualization encountered an error while fetching backend data.");
        }
        
        if (!hasSpinner && hasContent) {
          // Allow Recharts and CSS transitions 800ms to finish rendering paths and labels
          await new Promise(r => setTimeout(r, 800));
          inlineSvgStyles(container);
          return true;
        }
      }
      await new Promise(r => setTimeout(r, 200));
    }
    
    // Check if partial content is available before giving up
    if (container && container.querySelector('.kpi-grid, .charts-grid, table, .recharts-surface')) {
      inlineSvgStyles(container);
      return true;
    }
    throw new Error("Timed out waiting for visualization data and charts to finish rendering.");
  };

  const captureNode = async (node) => {
    inlineSvgStyles(node);
    
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1280,
      windowHeight: node.scrollHeight || 1200,
      x: 0,
      y: 0,
      width: node.scrollWidth || 1280,
      height: node.scrollHeight || 1200,
      onclone: (clonedDoc, clonedNode) => {
        // Reset cloned node to standard static layout flow so bounds are clean (0, 0)
        clonedNode.style.position = 'static';
        clonedNode.style.left = '0px';
        clonedNode.style.top = '0px';
        clonedNode.style.margin = '0px';
        clonedNode.style.width = '1280px';
        clonedNode.style.height = 'auto';
        clonedNode.style.overflow = 'visible';

        // Fix any remaining SVG CSS variables in cloned DOM
        const svgs = clonedNode.querySelectorAll('svg, svg *');
        svgs.forEach(el => {
          ['fill', 'stroke', 'stop-color'].forEach(attr => {
            const val = el.getAttribute(attr);
            if (val && val.includes('var(')) {
              if (val.includes('--primary-color')) el.setAttribute(attr, '#2E7D32');
              else if (val.includes('--primary-light')) el.setAttribute(attr, '#4CAF50');
              else if (val.includes('--primary-dark')) el.setAttribute(attr, '#1B5E20');
              else if (val.includes('--text-main')) el.setAttribute(attr, '#333333');
              else if (val.includes('--text-muted')) el.setAttribute(attr, '#757575');
              else if (val.includes('--danger')) el.setAttribute(attr, '#D32F2F');
              else el.setAttribute(attr, '#2E7D32');
            }
          });
        });
      }
    });
    return canvas;
  };

  const exportSingleVisual = async (componentName, format, stageIndex = null) => {
    if (loadingMsg) return;
    
    const stageSuffix = stageIndex !== null ? `_Stage${stageIndex + 1}` : '';
    setLoadingMsg(`Rendering ${componentName}${stageSuffix} for ${format.toUpperCase()} export...`);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (stageIndex !== null) {
      setStoryStage(stageIndex);
    }
    setExportTarget(componentName);

    try {
      // Allow React component to mount
      await new Promise(r => setTimeout(r, 400));
      
      const container = hiddenContainerRef.current;
      if (!container) throw new Error("Export container is not available.");
      
      setLoadingMsg(`Loading data and rendering charts for ${componentName}${stageSuffix}...`);
      await waitForContentReady(container);

      setLoadingMsg(`Capturing high-resolution visual...`);
      const canvas = await captureNode(container);
      
      const ts = getTimestampStr();
      const filename = `CampusPulse_${componentName}${stageSuffix}_${ts}`;

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 300);
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdfWidth = canvas.width / 2;
        const pdfHeight = canvas.height / 2;
        
        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [pdfWidth, pdfHeight]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${filename}.pdf`);
      }
      
      setSuccessMsg(`Successfully generated ${format.toUpperCase()} for ${componentName}${stageSuffix} (${filename}.${format}).`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error("Export error:", err);
      setErrorMsg(`Export failed: ${err.message || 'Unable to generate export'}`);
    } finally {
      setExportTarget(null);
      setLoadingMsg(null);
    }
  };

  const exportStorytellingFullPdf = async () => {
    if (loadingMsg) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setExportTarget('Storytelling');

    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 850] });
      const container = hiddenContainerRef.current;

      for (let s = 0; s < 8; s++) {
        setLoadingMsg(`Capturing Storytelling Stage ${s + 1} of 8 (${STORY_STAGES[s]})...`);
        setStoryStage(s);
        
        // Allow stage re-render
        await new Promise(r => setTimeout(r, 500));
        await waitForContentReady(container, 15000);
        
        const canvas = await captureNode(container);
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (s > 0) pdf.addPage([1280, 850], 'landscape');
        
        const naturalW = canvas.width / 2;
        const naturalH = canvas.height / 2;
        const ratio = Math.min(1280 / naturalW, 850 / naturalH);
        const w = naturalW * ratio;
        const h = naturalH * ratio;
        const offsetX = (1280 - w) / 2;
        const offsetY = (850 - h) / 2;
        
        pdf.addImage(imgData, 'JPEG', offsetX, offsetY, w, h);
      }

      const ts = getTimestampStr();
      const filename = `CampusPulse_Storytelling_Full_8_Stages_${ts}.pdf`;
      pdf.save(filename);
      setSuccessMsg(`Successfully generated 8-page complete Storytelling PDF (${filename}).`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error("Storytelling PDF Export Error:", err);
      setErrorMsg(`Storytelling PDF export failed: ${err.message || 'Error compiling stages'}`);
    } finally {
      setStoryStage(0);
      setExportTarget(null);
      setLoadingMsg(null);
    }
  };

  const renderExportTarget = () => {
    if (!exportTarget) return null;
    const context = { globalCacheTimestamp, setGlobalCacheTimestamp };
    
    let child = null;
    switch (exportTarget) {
      case 'Dashboard': child = <Dashboard />; break;
      case 'Practical13': child = <Practical13 />; break;
      case 'Practical14': child = <Practical14 />; break;
      case 'Practical15': child = <Practical15 />; break;
      case 'DataQuality': child = <DataQuality />; break;
      case 'Storytelling': child = <Storytelling forceStage={storyStage} />; break;
      default: return null;
    }

    return (
      <MockRouter context={context}>
        {child}
      </MockRouter>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-main)' }}>Export Center</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '1.05rem' }}>
        Generate high-resolution PNG visualizations, multi-page PDF documents, and structured Excel/CSV datasets. 
        All exports reflect the <strong>current live state</strong> of the simulation.
      </p>

      {loadingMsg && (
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          color: '#1565c0', 
          padding: '16px 20px', 
          borderRadius: '8px', 
          marginBottom: '24px', 
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid #90caf9'
        }}>
          <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div>
          <span>{loadingMsg}</span>
        </div>
      )}
      
      {successMsg && (
        <div style={{ 
          backgroundColor: '#e8f5e9', 
          color: '#2e7d32', 
          padding: '16px 20px', 
          borderRadius: '8px', 
          marginBottom: '24px', 
          fontWeight: '600',
          border: '1px solid #a5d6a7'
        }}>
          ✅ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '16px 20px', 
          borderRadius: '8px', 
          marginBottom: '24px', 
          fontWeight: '600',
          border: '1px solid #ef9a9a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>❌ {errorMsg}</span>
          <button 
            onClick={() => setErrorMsg(null)}
            style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Live Dataset */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '10px' }}>Live Dataset</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px', fontSize: '0.92rem' }}>
            Export the complete 5-worksheet academic dataset. Contains Students, Programs, Courses, Enrollments, and Learning Activity.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => handleStructuredExport('dataset', 'xlsx')}
            >
              EXCEL (.xlsx)
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => handleStructuredExport('dataset', 'csv')}
            >
              CSV (.zip)
            </button>
          </div>
        </div>

        {/* Dashboard */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '10px' }}>Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px', fontSize: '0.92rem' }}>
            Complete visual snapshot of executive KPIs, program score distributions, risk segmentation, and enrollment trend charts.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => exportSingleVisual('Dashboard', 'png')}
            >
              PNG Image
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => exportSingleVisual('Dashboard', 'pdf')}
            >
              PDF Document
            </button>
          </div>
        </div>

        {/* Practical 13 */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '10px' }}>Practical 13</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px', fontSize: '0.92rem' }}>
            Academic Performance Analysis: program mark distributions, course pass rates, attendance correlations, and credit ratios.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => exportSingleVisual('Practical13', 'png')}
            >
              PNG
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => exportSingleVisual('Practical13', 'pdf')}
            >
              PDF
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => handleStructuredExport('practical13', 'xlsx')}
            >
              EXCEL
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => handleStructuredExport('practical13', 'csv')}
            >
              CSV
            </button>
          </div>
        </div>

        {/* Practical 14 */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '10px' }}>Practical 14</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px', fontSize: '0.92rem' }}>
            Student Segmentation Analysis: academic risk levels, scholarship awards, digital LMS engagement, and assignment completion.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => exportSingleVisual('Practical14', 'png')}
            >
              PNG
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => exportSingleVisual('Practical14', 'pdf')}
            >
              PDF
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => handleStructuredExport('practical14', 'xlsx')}
            >
              EXCEL
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => handleStructuredExport('practical14', 'csv')}
            >
              CSV
            </button>
          </div>
        </div>

        {/* Practical 15 */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '10px' }}>Practical 15</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px', fontSize: '0.92rem' }}>
            Historical Trends & Forecasting: longitudinal enrollment trends, assessment score trajectories, and hybrid predictive models.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => exportSingleVisual('Practical15', 'png')}
            >
              PNG
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => exportSingleVisual('Practical15', 'pdf')}
            >
              PDF
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => handleStructuredExport('practical15', 'xlsx')}
            >
              EXCEL
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => handleStructuredExport('practical15', 'csv')}
            >
              CSV (.zip)
            </button>
          </div>
        </div>

        {/* Data Quality */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '10px' }}>Data Quality</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px', fontSize: '0.92rem' }}>
            Complete audit validation: schema metrics, missing values classification, key uniqueness, and business anomaly analysis.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => exportSingleVisual('DataQuality', 'png')}
            >
              PNG
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => exportSingleVisual('DataQuality', 'pdf')}
            >
              PDF
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => handleStructuredExport('data-quality', 'xlsx')}
            >
              EXCEL
            </button>
            <button 
              className="nav-btn" 
              disabled={loadingMsg !== null}
              onClick={() => handleStructuredExport('data-quality', 'csv')}
            >
              CSV (.zip)
            </button>
          </div>
        </div>

        {/* Storytelling */}
        <div className="card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '10px' }}>
            Guided Storytelling Presentation
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.92rem' }}>
            Export individual presentation stages as high-resolution PNG/PDF slides, or compile all 8 stages into an 8-page landscape master PDF report.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ minWidth: '320px', flex: '1 1 300px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Select Stage for Single-Stage Export:
              </label>
              <select 
                value={selectedStoryStage} 
                onChange={(e) => setSelectedStoryStage(Number(e.target.value))}
                disabled={loadingMsg !== null}
                style={{ 
                  width: '100%', 
                  padding: '9px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--card-bg)', 
                  color: 'var(--text-main)', 
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {STORY_STAGES.map((title, idx) => (
                  <option key={idx} value={idx}>{title}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end', paddingTop: '22px' }}>
              <button 
                className="nav-btn" 
                disabled={loadingMsg !== null}
                onClick={() => exportSingleVisual('Storytelling', 'png', selectedStoryStage)}
              >
                Export Stage PNG
              </button>
              <button 
                className="nav-btn" 
                disabled={loadingMsg !== null}
                onClick={() => exportSingleVisual('Storytelling', 'pdf', selectedStoryStage)}
              >
                Export Stage PDF
              </button>
              <button 
                className="nav-btn" 
                disabled={loadingMsg !== null}
                onClick={exportStorytellingFullPdf}
                style={{ 
                  backgroundColor: loadingMsg ? '#a5d6a7' : 'var(--primary-color)', 
                  color: 'white', 
                  fontWeight: '600' 
                }}
              >
                Full Story PDF (All 8 Stages)
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Robust offscreen rendering container positioned out-of-viewport with positive coordinates and full natural height */}
      <div 
        style={{ 
          position: 'fixed', 
          left: '200vw', 
          top: '0px', 
          width: '1280px', 
          height: 'auto', 
          minHeight: '800px', 
          overflow: 'visible', 
          backgroundColor: '#ffffff', 
          zIndex: -9999, 
          pointerEvents: 'none' 
        }}
      >
        <div 
          ref={hiddenContainerRef} 
          style={{ 
            width: '1280px', 
            backgroundColor: '#ffffff', 
            color: '#333333', 
            padding: '24px', 
            boxSizing: 'border-box' 
          }}
        >
          {renderExportTarget()}
        </div>
      </div>

    </div>
  );
};

export default Exports;
