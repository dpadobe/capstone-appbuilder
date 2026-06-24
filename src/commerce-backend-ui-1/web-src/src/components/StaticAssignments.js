import React, { useState, useEffect } from 'react'
import actionWebInvoke from '../utils'
import actions from '../actions'
import Spinner from './Spinner'
import BadgeChip from './BadgeChip'
import { IconPlus, IconList, IconDeviceFloppy, IconTrash } from '@tabler/icons-react'
import ConfirmModal from './ConfirmModal'

const BADGE_IDS = [
  'on_sale', 'hot_deal', 'clearance', 'christmas_sale', 'black_friday',
  'summer_sale', 'new_arrival', 'limited_edition', 'staff_pick', 'best_seller'
]

const emptyForm = { sku: '', badge_id: 'on_sale', expires_at: '' }

function StaticAssignments ({ ims }) {
  const authHeader = ims?.token ? { Authorization: `Bearer ${ims.token}` } : {}
  const [assignments, setAssignments] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [loadingData, setLoadingData] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    loadAssignments()
    loadProducts()
  }, [])

  async function loadAssignments () {
    setLoadingData(true)
    setAssignments([])
    try {
      const res = await actionWebInvoke(actions['get-static-assignments'], {}, {}, { method: 'GET' })
      setAssignments(res.assignments || [])
    } catch (e) {
      setMessage('Error loading assignments: ' + e.message)
    }
    setLoadingData(false)
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
    setSaving(true)
    setMessage('')

    const existing = assignments.find(a => a.sku === form.sku)
    if (existing) {
      const confirmed = window.confirm('A badge assignment already exists for this product. Do you want to replace it?')
      if (!confirmed) { setSaving(false); return }
    }

    try {
      await actionWebInvoke(actions['save-static-assignment'], authHeader, {
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
    setSaving(false)
  }

  async function deleteAssignment (id) {
    setLoadingData(true)
    setConfirmDeleteId(null)
    try {
      await actionWebInvoke(actions['delete-static-assignment'], authHeader, { _id: id })
      setMessage('Assignment deleted')
      await loadAssignments()
    } catch (e) {
      setMessage('Error deleting assignment: ' + e.message)
    }
    setLoadingData(false)
  }

  return (
    <div className='bm-page'>
      {confirmDeleteId && (
        <ConfirmModal
          message='Delete this assignment? This action cannot be undone.'
          onConfirm={() => deleteAssignment(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {message && (
        <div className={`bm-msg ${message.includes('Error') ? 'bm-msg--error' : 'bm-msg--success'}`}>
          {message}
        </div>
      )}

      <div className='bm-section-header'>
        <span className='bm-section-pill'><IconPlus size={12} style={{ verticalAlign: '-2px', marginRight: '4px' }} />Assign badge to product</span>
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
            <button type='submit' className='bm-btn-save' disabled={saving}>
              {saving ? 'Saving...' : <><IconDeviceFloppy size={15} style={{ verticalAlign: '-3px', marginRight: '5px' }} />Save assignment</>}
            </button>
          </div>
        </form>
      </div>

      <div className='bm-section-header'>
        <span className='bm-section-pill'><IconList size={12} style={{ verticalAlign: '-2px', marginRight: '4px' }} />Existing assignments</span>
        <span className='bm-section-line' />
      </div>

      <div className='bm-card'>
        {loadingData && <Spinner />}
        {!loadingData && assignments.length === 0 && <p className='bm-empty'>No manual assignments yet.</p>}
        {!loadingData && assignments.length > 0 && (
          <table className='bm-table'>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Badge</th>
                <th>Expires at</th>
                <th>Assigned at</th>
                <th className='bm-table-action'></th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a._id}>
                  <td className='bm-table-name'>{a.sku}</td>
                  <td><BadgeChip badgeId={a.badge_id} /></td>
                  <td className='bm-table-muted'>{a.expires_at ? new Date(a.expires_at).toLocaleDateString() : '—'}</td>
                  <td className='bm-table-muted'>{new Date(a.assigned_at).toLocaleDateString()}</td>
                  <td className='bm-table-action'>
                    <button className='bm-btn-delete' onClick={() => setConfirmDeleteId(a._id)}>
                      <IconTrash size={13} style={{ verticalAlign: '-2px', marginRight: '4px' }} />Delete
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
