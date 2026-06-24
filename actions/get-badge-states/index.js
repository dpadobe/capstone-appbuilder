// Returns all evaluated badge state records from badge_state sorted by evaluated_at descending.
const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { generateAccessToken } = require('../auth')

async function main(params) {
  const logger = Core.Logger('get-badge-states', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('get-badge-states action invoked')

    const token = await generateAccessToken(params)
    const dbBase = await libDb.init({ token: token.access_token })
    const db = await dbBase.connect()
    const collection = await db.collection('badge_state')

    const badgeStates = await collection.findArray({})

    const sorted = badgeStates.sort((a, b) => new Date(b.evaluated_at) - new Date(a.evaluated_at))

    return {
      statusCode: 200,
      body: { status: 'ok', count: sorted.length, badge_states: sorted }
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
