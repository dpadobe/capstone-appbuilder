// Deletes a badge rule from badge_rules by _id.
const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { ObjectId } = require('bson')
const { generateAccessToken } = require('../auth')

async function main(params) {
  const logger = Core.Logger('delete-badge-rule', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('delete-badge-rule action invoked')

    const body = params.__ow_body ? JSON.parse(params.__ow_body) : params

    if (!body._id) {
      return {
        statusCode: 400,
        body: { status: 'error', message: 'Missing required field: _id' }
      }
    }

    const token = await generateAccessToken(params)
    const dbBase = await libDb.init({ token: token.access_token })
    const db = await dbBase.connect()
    const collection = await db.collection('badge_rules')

    const result = await collection.deleteOne({ _id: new ObjectId(body._id) })

    if (result.deletedCount === 0) {
      return {
        statusCode: 404,
        body: { status: 'error', message: `No rule found with _id: ${body._id}` }
      }
    }

    logger.info(`Rule deleted: ${body._id}`)

    return {
      statusCode: 200,
      body: { status: 'ok', message: 'Badge rule deleted', _id: body._id }
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
