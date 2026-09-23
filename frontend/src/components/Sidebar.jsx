import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart2, 
  Users, 
  LineChart, 
  Presentation, 
  Activity, 
  ShieldCheck, 
  Download, 
  Info 
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/practical13', label: 'Practical 13', icon: <BarChart2 size={20} /> },
  { path: '/practical14', label: 'Practical 14', icon: <Users size={20} /> },
  { path: '/practical15', label: 'Practical 15', icon: <LineChart size={20} /> },
  { path: '/storytelling', label: 'Storytelling', icon: <Presentation size={20} /> },
  { path: '/live', label: 'Live Simulation', icon: <Activity size={20} /> },
  { path: '/data-quality', label: 'Data Quality', icon: <ShieldCheck size={20} /> },
  { path: '/exports', label: 'Export Center', icon: <Download size={20} /> },
  { path: '/about', label: 'About', icon: <Info size={20} /> },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        CampusPulse
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon">{item.icon}</div>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
