import React, { useState, useEffect } from 'react'
import actionWebInvoke from '../utils'
import actions from '../config.json'
import Spinner from './Spinner'

const CONDITION_TYPES = [
  { value: 'price_between', label: 'Price Between' },
  { value: 'discount_pct', label: 'Discount Percentage' },
  { value: 'recently_updated', label: 'Recently Updated' }
]

// TODO: load dynamically from get-badge-catalog action to stay in sync with badge_catalog collection
const BADGE_IDS = [
  'on_sale', 'hot_deal', 'clearance', 'christmas_sale', 'black_friday',
  'summer_sale', 'new_arrival', 'limited_edition', 'staff_pick', 'best_seller'
]

const emptyForm = { name: '', priority: '', condition_type: 'price_between', badge_id: 'on_sale', min: '', max: '', hours: '' }

function BadgeRules () {
  const [rules, setRules] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadRules() }, [])

  async function loadRules () {
    setLoading(true)
    setRules([])
    try {
      const res = await actionWebInvoke(actions['get-badge-rules'], {}, {}, { method: 'GET' })
      setRules(res.rules || [])
    } catch (e) {
      setMessage('Error loading rules: ' + e.message)
    }
    setLoading(false)
  }

  async function saveRule (e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      let condition_value = {}
      if (form.condition_type === 'price_between') condition_value = { min: Number(form.min), max: Number(form.max) }
      if (form.condition_type === 'discount_pct') condition_value = { min: Number(form.min) }
      if (form.condition_type === 'recently_updated') condition_value = { hours: Number(form.hours) }

      await actionWebInvoke(actions['save-badge-rule'], {}, {
        name: form.name,
        priority: Number(form.priority),
        condition_type: form.condition_type,
        condition_value,
        badge_id: form.badge_id
      })
      setMessage('Rule saved successfully')
      setForm(emptyForm)
      await loadRules()
    } catch (e) {
      setMessage('Error saving rule: ' + e.message)
    }
    setLoading(false)
  }

  async function deleteRule (id) {
    if (!window.confirm('Delete this rule?')) return
    setLoading(true)
    try {
      await actionWebInvoke(actions['delete-badge-rule'], {}, { _id: id })
      setMessage('Rule deleted')
      await loadRules()
    } catch (e) {
      setMessage('Error deleting rule: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Manage Rules</h2>
      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

      <form onSubmit={saveRule} style={{ marginBottom: '30px', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
        <h3>Add New Rule</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label>Rule Name<br />
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ width: '100%' }} />
            </label>
          </div>
          <div>
            <label>Priority (lower = higher priority)<br />
              <input type='number' value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} required style={{ width: '100%' }} />
            </label>
          </div>
          <div>
            <label>Condition Type<br />
              <select value={form.condition_type} onChange={e => setForm({ ...form, condition_type: e.target.value })} style={{ width: '100%' }}>
                {CONDITION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
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
          {form.condition_type === 'price_between' && (
            <div>
              <label>Min Price<br />
                <input type='number' value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} required style={{ width: '100%' }} />
              </label>
            </div>
          )}
          {form.condition_type === 'price_between' && (
            <div>
              <label>Max Price<br />
                <input type='number' value={form.max} onChange={e => setForm({ ...form, max: e.target.value })} required style={{ width: '100%' }} />
              </label>
            </div>
          )}
          {form.condition_type === 'discount_pct' && (
            <div>
              <label>Min Discount %<br />
                <input type='number' value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} required style={{ width: '100%' }} />
              </label>
            </div>
          )}
          {form.condition_type === 'recently_updated' && (
            <div>
              <label>Within Hours<br />
                <input type='number' value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} required style={{ width: '100%' }} />
              </label>
            </div>
          )}
        </div>
        <button type='submit' disabled={loading} style={{ marginTop: '12px' }}>
          {loading ? 'Saving...' : 'Save Rule'}
        </button>
        <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          Note: New rules apply only on next product save. Bulk apply is a future enhancement.
        </p>
      </form>

      {loading && <Spinner />}

      {!loading && (
        <>
          <h3>Existing Rules</h3>
          {rules.length === 0 && <p>No rules defined yet.</p>}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e0e0e0' }}>
                <th style={th}>Priority</th>
                <th style={th}>Name</th>
                <th style={th}>Condition</th>
                <th style={th}>Badge</th>
                <th style={th}>Created</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={td}>{rule.priority}</td>
                  <td style={td}>{rule.name}</td>
                  <td style={td}>{CONDITION_TYPES.find(t => t.value === rule.condition_type)?.label || rule.condition_type}: {JSON.stringify(rule.condition_value)}</td>
                  <td style={td}>{rule.badge_id.replace(/_/g, ' ')}</td>
                  <td style={td}>{new Date(rule.created_at).toLocaleDateString()}</td>
                  <td style={td}>
                    <button onClick={() => deleteRule(rule._id)} style={{ color: 'red' }}>Delete</button>
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

export default BadgeRules
