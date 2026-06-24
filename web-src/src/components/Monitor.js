import React, { useState, useEffect } from 'react'
import actionWebInvoke from '../utils'
import actions from '../config.json'
import Spinner from './Spinner'

function Monitor () {
  const [badgeStates, setBadgeStates] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadBadgeStates() }, [])

  async function loadBadgeStates () {
    setLoading(true)
    setBadgeStates([])
    try {
      const res = await actionWebInvoke(actions['get-badge-states'], {}, {}, { method: 'GET' })
      setBadgeStates(res.badge_states || [])
    } catch (e) {
      setMessage('Error loading badge states: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Active Badges</h2>
      <p style={{ color: '#666' }}>Current badge per product. Updated each time a product is saved in Commerce.</p>
      {message && <p style={{ color: 'red' }}>{message}</p>}

      <button onClick={loadBadgeStates} disabled={loading} style={{ marginBottom: '16px' }}>
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>

      {loading && <Spinner />}

      {!loading && (
        <>
          {badgeStates.length === 0 && <p>No badge states recorded yet. Save a product in Commerce to trigger evaluation.</p>}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e0e0e0' }}>
                <th style={th}>SKU</th>
                <th style={th}>Badge</th>
                <th style={th}>Source</th>
                <th style={th}>Rule</th>
                <th style={th}>Evaluated At</th>
              </tr>
            </thead>
            <tbody>
              {badgeStates.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={td}>{s.sku}</td>
                  <td style={td}>{s.badge_id ? s.badge_id.replace(/_/g, ' ') : '—'}</td>
                  <td style={td}>{s.source || '—'}</td>
                  <td style={td}>{s.rule_name || '—'}</td>
                  <td style={td}>{s.evaluated_at ? new Date(s.evaluated_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

const th = { padding: '8px', textAlign: 'left', fontWeight: 'bold' }
const td = { padding: '8px' }

export default Monitor
