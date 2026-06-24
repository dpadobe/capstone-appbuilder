const BASE = 'https://3967933-dpcomoope2-capston.adobeio-static.net/api/v1/web/capstone-appbuilder'

const actions = {
  'get-badge-rules': `${BASE}/get-badge-rules`,
  'save-badge-rule': `${BASE}/save-badge-rule`,
  'delete-badge-rule': `${BASE}/delete-badge-rule`,
  'get-static-assignments': `${BASE}/get-static-assignments`,
  'save-static-assignment': `${BASE}/save-static-assignment`,
  'delete-static-assignment': `${BASE}/delete-static-assignment`,
  'get-badge-catalog': `${BASE}/get-badge-catalog`,
  'get-badge-states': `${BASE}/get-badge-states`,
  'get-products': `${BASE}/get-products`,
  'setup-collections': `${BASE}/setup-collections`
}

export default actions
