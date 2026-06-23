const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { generateAccessToken } = require('../auth')

const REQUIRED_FIELDS = ['name', 'priority', 'condition_type', 'condition_value', 'badge_id']
const VALID_CONDITION_TYPES = ['price_between', 'discount_pct', 'recently_updated']

async function main(params) {
  const logger = Core.Logger('save-badge-rule', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('save-badge-rule action invoked')

    const body = params.__ow_body ? JSON.parse(params.__ow_body) : params

    for (const field of REQUIRED_FIELDS) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return {
          statusCode: 400,
          body: { status: 'error', message: `Missing required field: ${field}` }
        }
      }
    }

    if (!VALID_CONDITION_TYPES.includes(body.condition_type)) {
      return {
        statusCode: 400,
        body: { status: 'error', message: `Invalid condition_type. Must be one of: ${VALID_CONDITION_TYPES.join(', ')}` }
      }
    }

    const rule = {
      name: body.name,
      priority: Number(body.priority),
      condition_type: body.condition_type,
      condition_value: body.condition_value,
      badge_id: body.badge_id,
      created_at: new Date().toISOString()
    }

    const token = await generateAccessToken(params)
    const dbBase = await libDb.init({ token: token.access_token })
    const db = await dbBase.connect()
    const collection = await db.collection('badge_rules')

    await collection.insertOne(rule)
    logger.info(`Rule saved: ${rule.name}`)

    return {
      statusCode: 201,
      body: { status: 'ok', message: 'Badge rule saved', rule }
    }
  } catch (error) {
    logger.error(error)
    return {
      statusCode: 500,
      body: { status: 'error', message: error.message }
    }
  }
}

exports.main = main
