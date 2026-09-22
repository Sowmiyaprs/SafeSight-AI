import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LiveMonitoring } from './components/LiveMonitoring';
import { Violations } from './components/Violations';
import { Reports } from './components/Reports';
import { TechStackCosts } from './components/TechStackCosts';
import { Settings } from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'live':
        return <LiveMonitoring />;
      case 'violations':
        return <Violations />;
      case 'costs':
        return <TechStackCosts />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
