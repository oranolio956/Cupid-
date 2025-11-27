import React, { useState } from 'react';
import { Drawer, Menu } from 'antd';
import {
  MenuOutlined,
  DashboardOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import './wrapper.css';

function Wrapper({ children }) {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => {
        window.location.href = '/';
        setDrawerVisible(false);
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        setDrawerVisible(false);
        // Navigate to settings
      }
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: 'About',
      onClick: () => {
        setDrawerVisible(false);
        // Show about modal
      }
    },
  ];

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <button 
          className="hamburger-btn"
          onClick={() => setDrawerVisible(true)}
          aria-label="Open menu"
        >
          <MenuOutlined />
        </button>
        <h1 className="app-title">Spark</h1>
        <div className="header-spacer"></div>
      </header>

      {/* Drawer Menu */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        className="mobile-drawer"
      >
        <Menu
          mode="vertical"
          items={menuItems}
          style={{ border: 'none' }}
        />
      </Drawer>

      {/* Main Content */}
      <main className="app-content">
        {children}
      </main>
    </div>
  );
}

export default Wrapper;