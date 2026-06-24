import React, { useState, useEffect } from 'react'
import actionWebInvoke from '../utils'
import actions from '../config.json'
import Spinner from './Spinner'

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
      if (!confirmed) {
        setLoading(false)
        return
      }
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
    <div style={{ padding: '20px' }}>
      <h2>Manual Assignments</h2>
      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

      <form onSubmit={saveAssignment} style={{ marginBottom: '30px', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
        <h3>Assign Badge to Product</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label>Product<br />
              <select value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required style={{ width: '100%' }}>
                <option value=''>-- Select Product --</option>
                {products.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
              </select>
            </label>
          </div>
          <div>
            <label>Badge<br />
              <select value={form.badge_id} onChange={e => setForm({ ...form, badge_id: e.target.value })} style={{ width: '100%' }}>
                {BADGE_IDS.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
          </div>
          <div>
            <label>Expires At (optional)<br />
              <input type='date' value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} style={{ width: '100%' }} />
            </label>
          </div>
        </div>
        <button type='submit' disabled={loading} style={{ marginTop: '12px' }}>
          {loading ? 'Saving...' : 'Save Assignment'}
        </button>
      </form>

      {loading && <Spinner />}

      {!loading && (
        <>
          <h3>Existing Assignments</h3>
          {assignments.length === 0 && <p>No manual assignments yet.</p>}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e0e0e0' }}>
                <th style={th}>SKU</th>
                <th style={th}>Badge</th>
                <th style={th}>Expires At</th>
                <th style={th}>Assigned At</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={td}>{a.sku}</td>
                  <td style={td}>{a.badge_id.replace(/_/g, ' ')}</td>
                  <td style={td}>{a.expires_at ? new Date(a.expires_at).toLocaleDateString() : '—'}</td>
                  <td style={td}>{new Date(a.assigned_at).toLocaleDateString()}</td>
                  <td style={td}>
                    <button onClick={() => deleteAssignment(a._id)} style={{ color: 'red' }}>Delete</button>
                  </td>
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

export default StaticAssignments
