import React from 'react'

function ConfirmModal ({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px 28px',
        width: '340px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
      }}>
        <p style={{ fontSize: '14px', color: '#1a1a1a', marginBottom: '20px', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className='bm-btn-secondary' style={{ marginBottom: 0 }} onClick={onCancel}>
            Cancel
          </button>
          <button className='bm-btn-delete' style={{ background: '#E24B4A', color: '#fff' }} onClick={onConfirm}>
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
