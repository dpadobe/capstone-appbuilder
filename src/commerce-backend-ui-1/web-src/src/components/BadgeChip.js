import React from 'react'

const CLASS_MAP = {
  on_sale: 'bm-badge--sale',
  hot_deal: 'bm-badge--deal',
  clearance: 'bm-badge--sale',
  christmas_sale: 'bm-badge--sale',
  black_friday: 'bm-badge--deal',
  summer_sale: 'bm-badge--new',
  new_arrival: 'bm-badge--new',
  limited_edition: 'bm-badge--limited',
  staff_pick: 'bm-badge--staff',
  best_seller: 'bm-badge--best'
}

function BadgeChip ({ badgeId }) {
  const cls = CLASS_MAP[badgeId] || 'bm-badge--default'
  return (
    <span className={`bm-badge ${cls}`}>
      <span className='bm-badge-dot' />
      {badgeId ? badgeId.replace(/_/g, ' ') : '—'}
    </span>
  )
}

export default BadgeChip
