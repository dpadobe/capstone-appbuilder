import React, { useState, useEffect } from 'react'
import actionWebInvoke from '../utils'
import actions from '../actions'
import Spinner from './Spinner'
import BadgeChip from './BadgeChip'

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
    <div className='bm-page'>
      {message && <div className='bm-msg bm-msg--error'>{message}</div>}

      <div className='bm-section-header'>
        <span className='bm-section-pill'>◉ Active badges</span>
        <span className='bm-section-line' />
      </div>

      <div className='bm-card'>
        <p className='bm-table-muted' style={{ marginBottom: '16px', fontSize: '13px' }}>
          Current badge per product. Updated each time a product is saved in Commerce.
        </p>
        <button className='bm-btn-secondary' onClick={loadBadgeStates} disabled={loading}>
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>

        {loading && <Spinner />}
        {!loading && badgeStates.length === 0 && (
          <p className='bm-empty'>No badge states recorded yet. Save a product in Commerce to trigger evaluation.</p>
        )}
        {!loading && badgeStates.length > 0 && (
          <table className='bm-table'>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Badge</th>
                <th>Source</th>
                <th>Rule</th>
                <th>Evaluated at</th>
              </tr>
            </thead>
            <tbody>
              {badgeStates.map((s, i) => (
                <tr key={i}>
                  <td className='bm-table-name'>{s.sku}</td>
                  <td>{s.badge_id ? <BadgeChip badgeId={s.badge_id} /> : '—'}</td>
                  <td className='bm-table-muted'>{s.source || '—'}</td>
                  <td className='bm-table-muted'>{s.rule_name || '—'}</td>
                  <td className='bm-table-muted'>{s.evaluated_at ? new Date(s.evaluated_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Monitor
