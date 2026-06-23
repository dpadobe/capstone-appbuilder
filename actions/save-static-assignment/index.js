const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { generateAccessToken } = require('../auth')

async function main(params) {
  const logger = Core.Logger('save-static-assignment', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('save-static-assignment action invoked')

    const body = params.__ow_body ? JSON.parse(params.__ow_body) : params

    if (!body.sku || !body.badge_id) {
      return {
        statusCode: 400,
        body: { status: 'error', message: 'Missing required fields: sku, badge_id' }
      }
    }

    const assignment = {
      sku: body.sku,
      badge_id: body.badge_id,
      expires_at: body.expires_at || null,
      assigned_at: new Date().toISOString()
    }

    const token = await generateAccessToken(params)
    const dbBase = await libDb.init({ token: token.access_token })
    const db = await dbBase.connect()
    const collection = await db.collection('badge_assignments')

    const existing = await collection.findArray({ sku: body.sku })

    if (existing.length > 0) {
      await collection.updateOne({ sku: body.sku }, { $set: assignment })
      logger.info(`Static assignment updated for SKU: ${body.sku}`)
      return {
        statusCode: 200,
        body: { status: 'ok', message: 'Static assignment updated', assignment }
      }
    }

    await collection.insertOne(assignment)
    logger.info(`Static assignment created for SKU: ${body.sku}`)

    return {
      statusCode: 201,
      body: { status: 'ok', message: 'Static assignment created', assignment }
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
