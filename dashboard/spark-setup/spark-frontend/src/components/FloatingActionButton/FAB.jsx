import React, { useState } from 'react';
import { PlusOutlined, ReloadOutlined, SettingOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import './FAB.css';

const FAB = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { key: 'refresh', icon: <ReloadOutlined />, label: 'Refresh', color: '#52c41a' },
    { key: 'add-client', icon: <AppstoreAddOutlined />, label: 'Add Client', color: '#1890ff' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings', color: '#722ed1' }
  ];

  const handleActionClick = (key) => {
    onAction(key);
    setIsOpen(false);
  };

  return (
    <div className="fab-container">
      {isOpen && (
        <div className="fab-backdrop" onClick={() => setIsOpen(false)} />
      )}
      
      {isOpen && (
        <div className="fab-actions">
          {actions.map((action, index) => (
            <button
              key={action.key}
              className="fab-action"
              style={{
                backgroundColor: action.color,
                animationDelay: `${index * 50}ms`
              }}
              onClick={() => handleActionClick(action.key)}
            >
              {action.icon}
              <span className="fab-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}
      
      <button
        className={`fab-main ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <PlusOutlined 
          style={{ 
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }} 
        />
      </button>
    </div>
  );
};

export default FAB;
