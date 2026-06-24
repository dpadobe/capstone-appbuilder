import React, { useState, useEffect } from 'react'
import actionWebInvoke from '../utils'
import actions from '../actions'
import Spinner from './Spinner'
import BadgeChip from './BadgeChip'
import { IconPlus, IconList, IconDeviceFloppy, IconTrash } from '@tabler/icons-react'
import ConfirmModal from './ConfirmModal'

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

function formatCondition (type, value) {
  if (!value) return '—'
  if (type === 'price_between') return `Price Between $${value.min} – $${value.max}`
  if (type === 'discount_pct') return `Discount ≥ ${value.min}%`
  if (type === 'recently_updated') return `Updated within ${value.hours}h`
  return JSON.stringify(value)
}

function BadgeRules () {
  const authHeader = {}
  const [rules, setRules] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [loadingData, setLoadingData] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => { loadRules() }, [])

  async function loadRules () {
    setLoadingData(true)
    setRules([])
    try {
      const res = await actionWebInvoke(actions['get-badge-rules'], {}, {}, { method: 'GET' })
      setRules(res.rules || [])
    } catch (e) {
      setMessage('Error loading rules: ' + e.message)
    }
    setLoadingData(false)
  }

  async function saveRule (e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      let condition_value = {}
      if (form.condition_type === 'price_between') condition_value = { min: Number(form.min), max: Number(form.max) }
      if (form.condition_type === 'discount_pct') condition_value = { min: Number(form.min) }
      if (form.condition_type === 'recently_updated') condition_value = { hours: Number(form.hours) }

      await actionWebInvoke(actions['save-badge-rule'], authHeader, {
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
    setSaving(false)
  }

  async function deleteRule (id) {
    setLoadingData(true)
    setConfirmDeleteId(null)
    try {
      await actionWebInvoke(actions['delete-badge-rule'], authHeader, { _id: id })
      setMessage('Rule deleted')
      await loadRules()
    } catch (e) {
      setMessage('Error deleting rule: ' + e.message)
    }
    setLoadingData(false)
  }

  return (
    <div className='bm-page'>
      {confirmDeleteId && (
        <ConfirmModal
          message='Delete this rule? This action cannot be undone.'
          onConfirm={() => deleteRule(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {message && (
        <div className={`bm-msg ${message.includes('Error') ? 'bm-msg--error' : 'bm-msg--success'}`}>
          {message}
        </div>
      )}

      <div className='bm-section-header'>
        <span className='bm-section-pill'><IconPlus size={12} style={{ verticalAlign: '-2px', marginRight: '4px' }} />Add new rule</span>
        <span className='bm-section-line' />
      </div>

      <div className='bm-card'>
        <form onSubmit={saveRule}>
          <div className='bm-row-2'>
            <div className='bm-field'>
              <label>Rule name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder='e.g. Mid Range Products' required />
            </div>
            <div className='bm-field'>
              <label>Priority (lower = higher priority)</label>
              <input type='number' value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} placeholder='1' required />
            </div>
          </div>
          <div className='bm-row-2'>
            <div className='bm-field'>
              <label>Condition type</label>
              <select value={form.condition_type} onChange={e => setForm({ ...form, condition_type: e.target.value })}>
                {CONDITION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className='bm-field'>
              <label>Badge</label>
              <select value={form.badge_id} onChange={e => setForm({ ...form, badge_id: e.target.value })}>
                {BADGE_IDS.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          {form.condition_type === 'price_between' && (
            <div className='bm-row-2'>
              <div className='bm-field'>
                <label>Min price</label>
                <input type='number' value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} placeholder='0' required />
              </div>
              <div className='bm-field'>
                <label>Max price</label>
                <input type='number' value={form.max} onChange={e => setForm({ ...form, max: e.target.value })} placeholder='500' required />
              </div>
            </div>
          )}
          {form.condition_type === 'discount_pct' && (
            <div className='bm-row-2'>
              <div className='bm-field'>
                <label>Min discount %</label>
                <input type='number' value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} placeholder='10' required />
              </div>
              <div />
            </div>
          )}
          {form.condition_type === 'recently_updated' && (
            <div className='bm-row-2'>
              <div className='bm-field'>
                <label>Within hours</label>
                <input type='number' value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder='24' required />
              </div>
              <div />
            </div>
          )}
          <div className='bm-action-row'>
            <button type='submit' className='bm-btn-save' disabled={saving}>
              {saving ? 'Saving...' : <><IconDeviceFloppy size={15} style={{ verticalAlign: '-3px', marginRight: '5px' }} />Save rule</>}
            </button>
          </div>
          <p className='bm-hint'>New rules apply on next product save. Bulk apply is a future enhancement.</p>
        </form>
      </div>

      <div className='bm-section-header'>
        <span className='bm-section-pill'><IconList size={12} style={{ verticalAlign: '-2px', marginRight: '4px' }} />Existing rules</span>
        <span className='bm-section-line' />
      </div>

      <div className='bm-card'>
        {loadingData && <Spinner />}
        {!loadingData && rules.length === 0 && <p className='bm-empty'>No rules defined yet.</p>}
        {!loadingData && rules.length > 0 && (
          <table className='bm-table'>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Name</th>
                <th>Condition</th>
                <th>Badge</th>
                <th>Created</th>
                <th className='bm-table-action'></th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule._id}>
                  <td><span className='bm-pri-chip'>{rule.priority}</span></td>
                  <td className='bm-table-name'>{rule.name}</td>
                  <td className='bm-table-muted'>{formatCondition(rule.condition_type, rule.condition_value)}</td>
                  <td><BadgeChip badgeId={rule.badge_id} /></td>
                  <td className='bm-table-muted'>{new Date(rule.created_at).toLocaleDateString()}</td>
                  <td className='bm-table-action'>
                    <button className='bm-btn-delete' onClick={() => setConfirmDeleteId(rule._id)}>
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

export default BadgeRules
