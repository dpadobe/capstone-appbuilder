import React from 'react'

function Spinner () {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 0', color: '#666' }}>
      <div style={{
        width: '20px',
        height: '20px',
        border: '3px solid #e0e0e0',
        borderTop: '3px solid #1473e6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span>Loading...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default Spinner
