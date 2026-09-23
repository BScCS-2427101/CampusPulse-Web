import React, { useState, useRef, useEffect } from 'react';
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

const Exports = () => {
  const { globalCacheTimestamp, setGlobalCacheTimestamp } = useOutletContext();
  const [loadingMsg, setLoadingMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const hiddenContainerRef = useRef(null);
  const [exportTarget, setExportTarget] = useState(null);
  const [storyStage, setStoryStage] = useState(null);

  const getTimestampStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
  };

  const handleStructuredExport = (type, format) => {
    setLoadingMsg(`Generating ${format.toUpperCase()} for ${type}...`);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    const ts = getTimestampStr();
    const url = `/api/exports/${type}?format=${format}&_t=${globalCacheTimestamp || Date.now()}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `CampusPulse_${type}_${ts}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => {
      setLoadingMsg(null);
      setSuccessMsg(`Successfully downloaded ${format.toUpperCase()} for ${type}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 1000);
  };

  const captureNode = async (node) => {
    await new Promise(r => setTimeout(r, 2000));
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    return canvas;
  };

  const exportSingleVisual = async (componentName, format) => {
    setExportTarget(componentName);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const node = hiddenContainerRef.current.firstChild;
      if (!node) throw new Error("Could not find mounted component for export.");
      
      const canvas = await captureNode(node);
      const ts = getTimestampStr();
      const filename = `CampusPulse_${componentName}_${ts}`;

      if (format === 'png' || format === 'jpg') {
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${filename}.pdf`);
      }
      setSuccessMsg(`Successfully generated ${format.toUpperCase()} for ${componentName}.`);
    } catch (err) {
      console.error(err);
      setErrorMsg(`Failed to generate ${format.toUpperCase()}.`);
    } finally {
      setExportTarget(null);
    }
  };

  const exportStorytellingPDF = async () => {
    setExportTarget('Storytelling');
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 800] });
      
      for (let stage = 0; stage < 8; stage++) {
        setStoryStage(stage);
        await new Promise(r => setTimeout(r, 1500)); // wait for render
        const node = hiddenContainerRef.current.firstChild;
        if (!node) throw new Error("Could not find mounted Storytelling component.");
        
        const canvas = await captureNode(node);
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (stage > 0) pdf.addPage([1200, 800], 'landscape');
        
        // Scale to fit 1200x800 page
        const ratio = Math.min(1200 / canvas.width, 800 / canvas.height);
        const imgWidth = canvas.width * ratio;
        const imgHeight = canvas.height * ratio;
        pdf.addImage(imgData, 'JPEG', (1200 - imgWidth)/2, (800 - imgHeight)/2, imgWidth, imgHeight);
      }
      
      const ts = getTimestampStr();
      pdf.save(`CampusPulse_Storytelling_${ts}.pdf`);
      setSuccessMsg(`Successfully generated complete PDF for Storytelling.`);
    } catch (err) {
      console.error(err);
      setErrorMsg(`Failed to generate Storytelling PDF.`);
    } finally {
      setStoryStage(null);
      setExportTarget(null);
    }
  };

  const handleVisualExport = async (componentName, format) => {
    if (loadingMsg) return;
    setLoadingMsg(`Generating ${format.toUpperCase()} for ${componentName}...`);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (componentName === 'Storytelling' && format === 'pdf') {
      await exportStorytellingPDF();
      setLoadingMsg(null);
    } else {
      await exportSingleVisual(componentName, format);
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
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.1rem' }}>
        Generate offline reports, visual charts, and structured datasets. 
        All exports reflect the <strong>current live state</strong> of the simulation.
      </p>

      {loadingMsg && (
        <div style={{ backgroundColor: '#e3f2fd', color: '#1565c0', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold' }}>
          ⏳ {loadingMsg}
        </div>
      )}
      
      {successMsg && (
        <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold' }}>
          ✅ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold' }}>
          ❌ {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Dataset */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '12px' }}>Live Dataset</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px' }}>
            Export the complete current live dataset. The Excel file contains 5 sheets. The CSV export provides a ZIP of 5 files.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="nav-btn" onClick={() => handleStructuredExport('dataset', 'xlsx')}>EXCEL (.xlsx)</button>
            <button className="nav-btn" onClick={() => handleStructuredExport('dataset', 'csv')}>CSV (.zip)</button>
          </div>
        </div>

        {/* Dashboard */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '12px' }}>Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px' }}>
            Visual export of the main KPI dashboard.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="nav-btn" onClick={() => handleVisualExport('Dashboard', 'png')}>PNG</button>
            <button className="nav-btn" onClick={() => handleVisualExport('Dashboard', 'pdf')}>PDF</button>
          </div>
        </div>

        {/* Practical 13 */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '12px' }}>Practical 13</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px' }}>
            Academic Performance Analysis. Structured exports contain full unfiltered data.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="nav-btn" onClick={() => handleVisualExport('Practical13', 'png')}>PNG</button>
            <button className="nav-btn" onClick={() => handleVisualExport('Practical13', 'pdf')}>PDF</button>
            <button className="nav-btn" onClick={() => handleStructuredExport('practical13', 'xlsx')}>EXCEL</button>
            <button className="nav-btn" onClick={() => handleStructuredExport('practical13', 'csv')}>CSV</button>
          </div>
        </div>

        {/* Practical 14 */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '12px' }}>Practical 14</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px' }}>
            Student Segmentation Analysis. Structured exports contain full unfiltered data.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="nav-btn" onClick={() => handleVisualExport('Practical14', 'png')}>PNG</button>
            <button className="nav-btn" onClick={() => handleVisualExport('Practical14', 'pdf')}>PDF</button>
            <button className="nav-btn" onClick={() => handleStructuredExport('practical14', 'xlsx')}>EXCEL</button>
            <button className="nav-btn" onClick={() => handleStructuredExport('practical14', 'csv')}>CSV</button>
          </div>
        </div>

        {/* Practical 15 */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '12px' }}>Practical 15</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px' }}>
            Historical Trends & Forecasting. Structured exports contain full unfiltered data.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="nav-btn" onClick={() => handleVisualExport('Practical15', 'png')}>PNG</button>
            <button className="nav-btn" onClick={() => handleVisualExport('Practical15', 'pdf')}>PDF</button>
            <button className="nav-btn" onClick={() => handleStructuredExport('practical15', 'xlsx')}>EXCEL</button>
            <button className="nav-btn" onClick={() => handleStructuredExport('practical15', 'csv')}>CSV (.zip)</button>
          </div>
        </div>

        {/* Data Quality */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '12px' }}>Data Quality</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px' }}>
            Data integrity and validation results based on the live dataset.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="nav-btn" onClick={() => handleVisualExport('DataQuality', 'png')}>PNG</button>
            <button className="nav-btn" onClick={() => handleVisualExport('DataQuality', 'pdf')}>PDF</button>
            <button className="nav-btn" onClick={() => handleStructuredExport('data-quality', 'xlsx')}>EXCEL</button>
            <button className="nav-btn" onClick={() => handleStructuredExport('data-quality', 'csv')}>CSV (.zip)</button>
          </div>
        </div>

        {/* Storytelling */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '12px' }}>Storytelling</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', minHeight: '48px' }}>
            Guided presentation snapshot (Current Stage). PDF exports all 8 stages sequentially.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="nav-btn" onClick={() => handleVisualExport('Storytelling', 'png')}>PNG</button>
            <button className="nav-btn" onClick={() => handleVisualExport('Storytelling', 'pdf')}>PDF</button>
          </div>
        </div>

      </div>

      <div style={{ position: 'fixed', top: '-10000px', left: 0, width: '1200px', height: '800px', overflow: 'hidden', zIndex: -1 }}>
        <div ref={hiddenContainerRef} style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', padding: '24px' }}>
          {renderExportTarget()}
        </div>
      </div>

    </div>
  );
};

export default Exports;
