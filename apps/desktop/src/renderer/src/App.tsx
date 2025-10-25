import React, { useState, useEffect } from 'react';
import { Carousel, SubdomainConfig } from '../components/carousel';
import {
  FinancialSubdomain,
  HealthSubdomain,
  ScheduleSubdomain
} from '../components/subdomains';

function App() {
  const [currentSubdomain, setCurrentSubdomain] = useState<SubdomainConfig | null>(null);

  // Define subdomain configurations
  const subdomains: SubdomainConfig[] = [
    {
      id: 'financial',
      name: 'Financial',
      title: 'Financial Dashboard',
      icon: '💰',
      color: '#10b981',
      shortcut: 'Ctrl+1',
      component: FinancialSubdomain
    },
    {
      id: 'health',
      name: 'Health',
      title: 'Health & Fitness',
      icon: '🏃',
      color: '#ef4444',
      shortcut: 'Ctrl+2',
      component: HealthSubdomain
    },
    {
      id: 'schedule',
      name: 'Schedule',
      title: 'Schedule & Tasks',
      icon: '📅',
      color: '#3b82f6',
      shortcut: 'Ctrl+3',
      component: ScheduleSubdomain
    }
  ];

  // Handle subdomain changes
  const handleSubdomainChange = (subdomain: SubdomainConfig, index: number) => {
    setCurrentSubdomain(subdomain);
    console.log(`[App] Active subdomain changed to: ${subdomain.name} (index: ${index})`);

    // Report to main process
    if (window.api?.send) {
      window.api.send('subdomain-changed', {
        id: subdomain.id,
        name: subdomain.name,
        index
      });
    }
  };

  // Listen for app-level events
  useEffect(() => {
    console.log('[App] Personal Dashboard initialized');

    // Check for updates on startup
    if (window.api?.app?.checkForUpdates) {
      window.api.app.checkForUpdates().catch(err => {
        console.error('[App] Failed to check for updates:', err);
      });
    }

    // Set up window state listener
    const handleWindowStateChange = (state: any) => {
      console.log('[App] Window state changed:', state);
    };

    if (window.api?.on) {
      window.api.on('window-state-changed', handleWindowStateChange);
    }

    return () => {
      if (window.api?.off) {
        window.api.off('window-state-changed', handleWindowStateChange);
      }
    };
  }, []);

  return (
    <div className="app-container">
      <Carousel
        subdomains={subdomains}
        enableGestures={true}
        enableKeyboardNav={true}
        transitionDuration={300}
        snapThreshold={0.25}
        persistState={true}
        onSubdomainChange={handleSubdomainChange}
      />
    </div>
  );
}

export default App;