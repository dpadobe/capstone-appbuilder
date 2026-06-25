// Public-facing action: accepts a SKU query param, reads badge_state, and returns the resolved badge label for PDP display.
const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { generateAccessToken } = require('../auth')

const ALLOWED_ORIGINS = [
  'https://main--dpcom-storefront--dpadobe.aem.page',
  'https://main--dpcom-storefront--dpadobe.aem.live',
  'http://localhost:3000'
]

function corsHeaders (params) {
  const origin = params.__ow_headers?.origin || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}

async function main(params) {
  const logger = Core.Logger('product-badge', { level: params.LOG_LEVEL || 'info' })

  if (params.__ow_method === 'options') {
    return { statusCode: 204, headers: corsHeaders(params) }
  }

  try {
    const sku = params.sku || params.__ow_query?.sku
    if (!sku) return { statusCode: 400, headers: corsHeaders(params), body: { status: 'error', message: 'Missing required param: sku' } }
    const token = await generateAccessToken(params)
    const dbBase = await libDb.init({ token: token.access_token })
    const db = await dbBase.connect()
    const collection = await db.collection('badge_state')
    const results = await collection.findArray({ sku })
    const badgeState = results.length > 0 ? results[0] : null
    if (!badgeState || !badgeState.badge_id) return { statusCode: 200, headers: corsHeaders(params), body: { status: 'ok', sku, badge_id: null, badge_label: null } }
    const catalogCollection = await db.collection('badge_catalog')
    const catalog = await catalogCollection.findArray({ id: badgeState.badge_id })
    const badge = catalog.length > 0 ? catalog[0] : null
    return { statusCode: 200, headers: corsHeaders(params), body: { status: 'ok', sku, badge_id: badgeState.badge_id, badge_label: badge ? badge.label : badgeState.badge_id, source: badgeState.source, evaluated_at: badgeState.evaluated_at } }
  } catch (error) {
    logger.error(error)
    return { statusCode: 500, headers: corsHeaders(params), body: { status: 'error', message: error.message } }
  }
}

exports.main = main
