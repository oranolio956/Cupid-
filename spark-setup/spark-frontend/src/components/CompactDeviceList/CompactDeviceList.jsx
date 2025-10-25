import React from 'react';
import { formatSize } from '../../utils/utils';
import './CompactDeviceList.css';

const CompactDeviceList = ({ devices, onDeviceClick }) => {
  const getOSIcon = (osType) => {
    switch (osType?.toLowerCase()) {
      case 'windows':
        return '🪟';
      case 'darwin':
      case 'macos':
        return '🍎';
      case 'linux':
        return '🐧';
      default:
        return '💻';
    }
  };

  const getLatencyClass = (latency) => {
    if (!latency || latency >= 5000) return 'offline';
    if (latency < 100) return 'good';
    if (latency < 300) return 'warning';
    return 'poor';
  };

  return (
    <div className="compact-device-list">
      {devices.map(device => (
        <div 
          key={device.id}
          className="compact-device-item"
          onClick={() => onDeviceClick(device)}
        >
          <div className="compact-header">
            <span className="device-icon">
              {getOSIcon(device.os?.type)}
            </span>
            <div className="device-info">
              <h4>{device.hostname || 'Unknown Device'}</h4>
              <span className="device-ip">{device.ip || 'No IP'}</span>
            </div>
            <span className={`latency-badge ${getLatencyClass(device.latency)}`}>
              {device.latency ? `${device.latency}ms` : 'Offline'}
            </span>
          </div>
          
          <div className="compact-stats">
            <div className="stat-mini">
              <span className="stat-icon">💻</span>
              <div className="stat-details">
                <span className="stat-label">CPU</span>
                <span className="stat-value">{device.cpu?.usage?.toFixed(1) || 0}%</span>
              </div>
            </div>
            <div className="stat-mini">
              <span className="stat-icon">🧠</span>
              <div className="stat-details">
                <span className="stat-label">RAM</span>
                <span className="stat-value">{device.ram?.usage?.toFixed(1) || 0}%</span>
              </div>
            </div>
            <div className="stat-mini">
              <span className="stat-icon">💾</span>
              <div className="stat-details">
                <span className="stat-label">Disk</span>
                <span className="stat-value">{device.disk?.usage?.toFixed(1) || 0}%</span>
              </div>
            </div>
          </div>

          {device.net_stat && (
            <div className="compact-network">
              <span className="network-stat">
                ⬆️ {formatSize(device.net_stat.sent || 0)}
              </span>
              <span className="network-stat">
                ⬇️ {formatSize(device.net_stat.recv || 0)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CompactDeviceList;
