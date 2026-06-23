const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { generateAccessToken } = require('../auth')

async function main(params) {
  const logger = Core.Logger('product-badge', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('product-badge action invoked')

    const token = await generateAccessToken(params)
    const db = await libDb.init({ token: token.access_token })
    const pingResult = await db.ping()

    return {
      statusCode: 200,
      body: { status: 'ok', workspace: 'capston', db: pingResult }
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
