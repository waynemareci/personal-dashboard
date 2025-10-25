import React from 'react';
import Head from 'next/head';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard - Personal Dashboard</title>
      </Head>
      
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Dashboard</h1>
        <p>Your unified personal data dashboard</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
            <h3>💰 Financial</h3>
            <p>Track expenses, budgets, and financial goals</p>
            <button style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
              Coming Soon
            </button>
          </div>
          
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
            <h3>🏃 Health</h3>
            <p>Monitor workouts, meals, and health metrics</p>
            <button style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
              Coming Soon
            </button>
          </div>
          
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
            <h3>📅 Schedule</h3>
            <p>Manage tasks, events, and time blocking</p>
            <button style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}>
              Coming Soon
            </button>
          </div>
          
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
            <h3>🕸️ Knowledge Graph</h3>
            <p>Explore relationships between your data</p>
            <button style={{ padding: '0.5rem 1rem', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px' }}>
              Coming Soon
            </button>
          </div>
          
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Back to Home</a>
        </div>
      </main>
    </>
  );
}