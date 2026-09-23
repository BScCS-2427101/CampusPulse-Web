import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { getLiveStatus } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/global.css';

const MainLayout = ({ globalCacheTimestamp, setGlobalCacheTimestamp }) => {

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
