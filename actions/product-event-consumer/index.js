// Non-web event listener: triggered on Commerce product.save, evaluates badge rules in priority order, falls back to static assignment
// writes result to badge_state.
const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const fetch = require('node-fetch')
const { generateAccessToken } = require('../auth')
const { evaluateRule } = require('./evaluator')

async function fetchProduct(sku, token, params) {
  const url = `${params.COMMERCE_API_BASE_URL}/V1/products/${encodeURIComponent(sku)}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-api-key': params.IMS_OAUTH_S2S_CLIENT_ID,
      'x-gw-ims-org-id': params.IMS_OAUTH_S2S_ORG_ID
    }
  })
  if (!response.ok) {
    throw new Error(`Commerce product fetch failed: ${response.status} for SKU ${sku}`)
  }
  return response.json()
}

async function upsertBadgeState(collection, sku, badgeData) {
  const existing = await collection.findArray({ sku })
  const record = { sku, ...badgeData, evaluated_at: new Date().toISOString() }
  if (existing.length > 0) {
    await collection.updateOne({ sku }, { $set: record })
  } else {
    await collection.insertOne(record)
  }
}

async function main(params) {
  const logger = Core.Logger('product-event-consumer', { level: params.LOG_LEVEL || 'info' })

  try {
    const sku = params.data?.value?.sku
    if (!sku) {
      logger.error('No SKU found in event payload')
      return { statusCode: 400, body: { status: 'error', message: 'Missing SKU in event payload' } }
    }

    logger.info(`Processing product.save event for SKU: ${sku}`)

    const token = await generateAccessToken(params)
    const product = await fetchProduct(sku, token.access_token, params)
    logger.info(`Fetched product: ${product.name}`)

    const dbBase = await libDb.init({ token: token.access_token })
    const db = await dbBase.connect()

    const rulesCollection = await db.collection('badge_rules')
    const rules = await rulesCollection.findArray({})
    const sortedRules = rules.sort((a, b) => a.priority - b.priority)

    logger.info(`Evaluating ${sortedRules.length} rules for SKU: ${sku}`)

    let matchedRule = null
    for (const rule of sortedRules) {
      if (evaluateRule(rule, product)) {
        matchedRule = rule
        logger.info(`Rule matched: ${rule.name}`)
        break
      }
    }

    const badgeStateCollection = await db.collection('badge_state')

    if (matchedRule) {
      await upsertBadgeState(badgeStateCollection, sku, {
        badge_id: matchedRule.badge_id,
        source: 'rule',
        rule_name: matchedRule.name
      })
      logger.info(`Badge state written: ${matchedRule.badge_id} from rule ${matchedRule.name}`)
      return { statusCode: 200, body: { status: 'ok', sku, badge_id: matchedRule.badge_id, source: 'rule' } }
    }

    const assignmentsCollection = await db.collection('badge_assignments')
    const assignments = await assignmentsCollection.findArray({ sku })
    const now = new Date()
    const validAssignment = assignments.find(a => !a.expires_at || new Date(a.expires_at) > now)

    if (validAssignment) {
      await upsertBadgeState(badgeStateCollection, sku, {
        badge_id: validAssignment.badge_id,
        source: 'static',
        rule_name: null
      })
      logger.info(`Badge state written: ${validAssignment.badge_id} from static assignment`)
      return { statusCode: 200, body: { status: 'ok', sku, badge_id: validAssignment.badge_id, source: 'static' } }
    }

    await upsertBadgeState(badgeStateCollection, sku, {
      badge_id: null,
      source: null,
      rule_name: null
    })
    logger.info(`No badge matched for SKU: ${sku}, badge state cleared`)
    return { statusCode: 200, body: { status: 'ok', sku, badge_id: null, source: null } }

  } catch (error) {
    logger.error(error)
    return { statusCode: 500, body: { status: 'error', message: error.message } }
  }
}

exports.main = main
