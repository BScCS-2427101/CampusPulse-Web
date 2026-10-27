import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { getLiveStatus } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/global.css';

const ROUTE_TITLES = {
  '/': 'Dashboard | CampusPulse',
  '/dashboard': 'Dashboard | CampusPulse',
  '/practical13': 'Academic Performance Analysis | CampusPulse',
  '/practical14': 'Student Behaviour Analysis | CampusPulse',
  '/practical15': 'Historical Trends & Forecasting | CampusPulse',
  '/storytelling': 'Academic Data Storytelling | CampusPulse',
  '/live': 'Live Data Simulation | CampusPulse',
  '/live-simulation': 'Live Data Simulation | CampusPulse',
  '/data-quality': 'Data Quality | CampusPulse',
  '/exports': 'Export Centre | CampusPulse',
  '/export-center': 'Export Centre | CampusPulse',
  '/about': 'About the Project | CampusPulse'
};

const MainLayout = ({ globalCacheTimestamp, setGlobalCacheTimestamp }) => {
  const location = useLocation();

  // Page-specific browser title updater
  useEffect(() => {
    const title = ROUTE_TITLES[location.pathname] || 'CampusPulse — Academic Analytics';
    document.title = title;
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const data = await getLiveStatus();
        if (isMounted && data.cache_last_updated) {
          if (data.cache_last_updated !== globalCacheTimestamp) {
            setGlobalCacheTimestamp(data.cache_last_updated);
          }
        }
      } catch (err) {
        // silently fail polling
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [globalCacheTimestamp, setGlobalCacheTimestamp]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-container">
          <Outlet context={{ globalCacheTimestamp, setGlobalCacheTimestamp }} />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
