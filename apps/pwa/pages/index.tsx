import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Personal Dashboard</title>
        <meta name="description" content="Personal Dashboard powered by Dynamic Knowledge Graphs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Personal Dashboard PWA</h1>
        <p>Welcome to your Personal Dashboard powered by Dynamic Knowledge Graphs!</p>
        
        <div style={{ marginTop: '2rem' }}>
          <h2>Features Coming Soon:</h2>
          <ul>
            <li>📱 Mobile-optimized interface</li>
            <li>💾 Offline support with IndexedDB</li>
            <li>🔄 Real-time synchronization</li>
            <li>💰 Financial tracking</li>
            <li>🏃 Health metrics</li>
            <li>📅 Schedule management</li>
            <li>🕸️ Knowledge graph explorer</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Quick Links:</h3>
          <ul>
            <li><a href="/api/health">API Health Check</a></li>
            <li><a href="/dashboard">Dashboard (Coming Soon)</a></li>
          </ul>
        </div>
        
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <p>This is the Progressive Web App built with Next.js</p>
          <p>Install this app on your device for the best experience!</p>
        </div>
      </main>
    </>
  );
}