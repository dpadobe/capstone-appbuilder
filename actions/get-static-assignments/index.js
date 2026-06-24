// Returns all manual badge assignments from badge_assignments collection.
const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { generateAccessToken } = require('../auth')

async function main(params) {
  const logger = Core.Logger('get-static-assignments', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('get-static-assignments action invoked')

    const token = await generateAccessToken(params)
    const dbBase = await libDb.init({ token: token.access_token })
    const db = await dbBase.connect()
    const collection = await db.collection('badge_assignments')

    const assignments = await collection.findArray({})

    return {
      statusCode: 200,
      body: { status: 'ok', count: assignments.length, assignments }
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
