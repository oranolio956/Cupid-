import React from 'react';
import { HomeOutlined, AppstoreOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import './MobileBottomNav.css';

const MobileBottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'devices', icon: <AppstoreOutlined />, label: 'Devices' },
    { key: 'dashboard', icon: <HomeOutlined />, label: 'Dashboard' },
    { key: 'clients', icon: <UserOutlined />, label: 'Clients' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' }
  ];

  return (
    <div className="mobile-bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`nav-item ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MobileBottomNav;
