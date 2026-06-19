// Component for pages that are coming soon
import React from 'react';

const Soon = ({ label = "Feature" }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 120px)',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem',
      }}>
        ⏳
      </div>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#e2eeff',
      }}>
        {label} Coming Soon
      </h2>
      <p style={{
        fontSize: '1rem',
        color: '#a8c0d8',
        maxWidth: '400px',
      }}>
        This feature is currently under development. Please check back later!
      </p>
    </div>
  );
};

export default Soon;