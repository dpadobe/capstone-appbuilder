const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { generateAccessToken } = require('../auth')

async function main(params) {
  const logger = Core.Logger('get-badge-rules', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('get-badge-rules action invoked')

    const token = await generateAccessToken(params)
    const dbBase = await libDb.init({ token: token.access_token })
    const db = await dbBase.connect()
    const collection = await db.collection('badge_rules')

    const rules = await collection.findArray({})

    const sorted = rules.sort((a, b) => a.priority - b.priority)

    return {
      statusCode: 200,
      body: { status: 'ok', count: sorted.length, rules: sorted }
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
