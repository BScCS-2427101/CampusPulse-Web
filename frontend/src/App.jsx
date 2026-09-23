import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Practical13 from './pages/Practical13';
import Practical14 from './pages/Practical14';
import Practical15 from './pages/Practical15';
import Live from './pages/Live';
import DataQuality from './pages/DataQuality';
import Storytelling from './pages/Storytelling';
import Exports from './pages/Exports';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
  const [globalCacheTimestamp, setGlobalCacheTimestamp] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout globalCacheTimestamp={globalCacheTimestamp} setGlobalCacheTimestamp={setGlobalCacheTimestamp} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="practical13" element={<Practical13 />} />
          <Route path="practical14" element={<Practical14 />} />
          <Route path="practical15" element={<Practical15 />} />
          <Route path="storytelling" element={<Storytelling />} />
          <Route path="live" element={<Live />} />
          <Route path="data-quality" element={<DataQuality />} />
          <Route path="exports" element={<Exports />} />
          <Route path="about" element={<PlaceholderPage title="About Project" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
