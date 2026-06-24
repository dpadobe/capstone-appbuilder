// Returns all badge definitions from badge_catalog (id, label, color, description).
const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { generateAccessToken } = require('../auth')

async function main(params) {
  const logger = Core.Logger('get-badge-catalog', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('get-badge-catalog action invoked')

    const token = await generateAccessToken(params)
    const dbBase = await libDb.init({ token: token.access_token })
    const db = await dbBase.connect()
    const collection = await db.collection('badge_catalog')

    const badges = await collection.findArray({})

    return {
      statusCode: 200,
      body: { status: 'ok', count: badges.length, badges }
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
