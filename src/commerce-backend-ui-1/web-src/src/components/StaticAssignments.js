import React, { useState, useEffect } from 'react'
import actionWebInvoke from '../utils'
import actions from '../actions'
import Spinner from './Spinner'
import BadgeChip from './BadgeChip'

const BADGE_IDS = [
  'on_sale', 'hot_deal', 'clearance', 'christmas_sale', 'black_friday',
  'summer_sale', 'new_arrival', 'limited_edition', 'staff_pick', 'best_seller'
]

const emptyForm = { sku: '', badge_id: 'on_sale', expires_at: '' }

function StaticAssignments () {
  const [assignments, setAssignments] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAssignments()
    loadProducts()
  }, [])

  async function loadAssignments () {
    setLoading(true)
    setAssignments([])
    try {
      const res = await actionWebInvoke(actions['get-static-assignments'], {}, {}, { method: 'GET' })
      setAssignments(res.assignments || [])
    } catch (e) {
      setMessage('Error loading assignments: ' + e.message)
    }
    setLoading(false)
  }

  async function loadProducts () {
    try {
      const res = await actionWebInvoke(actions['get-products'], {}, {}, { method: 'GET' })
      setProducts(res.products || [])
    } catch (e) {
      setMessage('Error loading products: ' + e.message)
    }
  }

  async function saveAssignment (e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const existing = assignments.find(a => a.sku === form.sku)
    if (existing) {
      const confirmed = window.confirm('A badge assignment already exists for this product. Do you want to replace it?')
      if (!confirmed) { setLoading(false); return }
    }

    try {
      await actionWebInvoke(actions['save-static-assignment'], {}, {
        sku: form.sku,
        badge_id: form.badge_id,
        expires_at: form.expires_at || null
      })
      setMessage('Assignment saved successfully')
      setForm(emptyForm)
      await loadAssignments()
    } catch (e) {
      setMessage('Error saving assignment: ' + e.message)
    }
    setLoading(false)
  }

  async function deleteAssignment (id) {
    if (!window.confirm('Delete this assignment?')) return
    setLoading(true)
    try {
      await actionWebInvoke(actions['delete-static-assignment'], {}, { _id: id })
      setMessage('Assignment deleted')
      await loadAssignments()
    } catch (e) {
      setMessage('Error deleting assignment: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div className='bm-page'>
      {message && (
        <div className={`bm-msg ${message.includes('Error') ? 'bm-msg--error' : 'bm-msg--success'}`}>
          {message}
        </div>
      )}

      <div className='bm-section-header'>
        <span className='bm-section-pill'>+ Assign badge to product</span>
        <span className='bm-section-line' />
      </div>

      <div className='bm-card'>
        <form onSubmit={saveAssignment}>
          <div className='bm-row-2'>
            <div className='bm-field'>
              <label>Product</label>
              <select value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required>
                <option value=''>— Select product —</option>
                {products.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div className='bm-field'>
              <label>Badge</label>
              <select value={form.badge_id} onChange={e => setForm({ ...form, badge_id: e.target.value })}>
                {BADGE_IDS.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className='bm-row-2'>
            <div className='bm-field'>
              <label>Expires at (optional)</label>
              <input type='date' value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div />
          </div>
          <div className='bm-action-row'>
            <button type='submit' className='bm-btn-save' disabled={loading}>
              {loading ? 'Saving...' : '💾 Save assignment'}
            </button>
          </div>
        </form>
      </div>

      <div className='bm-section-header'>
        <span className='bm-section-pill'>☰ Existing assignments</span>
        <span className='bm-section-line' />
      </div>

      <div className='bm-card'>
        {loading && <Spinner />}
        {!loading && assignments.length === 0 && <p className='bm-empty'>No manual assignments yet.</p>}
        {!loading && assignments.length > 0 && (
          <table className='bm-table'>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Badge</th>
                <th>Expires at</th>
                <th>Assigned at</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a._id}>
                  <td className='bm-table-name'>{a.sku}</td>
                  <td><BadgeChip badgeId={a.badge_id} /></td>
                  <td className='bm-table-muted'>{a.expires_at ? new Date(a.expires_at).toLocaleDateString() : '—'}</td>
                  <td className='bm-table-muted'>{new Date(a.assigned_at).toLocaleDateString()}</td>
                  <td>
                    <button className='bm-btn-delete' onClick={() => deleteAssignment(a._id)}>
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default StaticAssignments
