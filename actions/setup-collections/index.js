const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { generateAccessToken } = require('../auth')

const COLLECTIONS = ['badge_catalog', 'badge_rules', 'badge_state', 'badge_assignments', 'collection_data_versions']

const BADGE_CATALOG_VERSION = 'v1'

//if changing version above, ensure to change data, as insert will only append for now - future enhance to be done.. DP
const BADGE_CATALOG = [
  { id: 'on_sale', label: 'On Sale' },
  { id: 'hot_deal', label: 'Hot Deal' },
  { id: 'clearance', label: 'Clearance' },
  { id: 'christmas_sale', label: 'Christmas Sale' },
  { id: 'black_friday', label: 'Black Friday' },
  { id: 'summer_sale', label: 'Summer Sale' },
  { id: 'new_arrival', label: 'New Arrival' },
  { id: 'limited_edition', label: 'Limited Edition' },
  { id: 'staff_pick', label: 'Staff Pick' },
  { id: 'best_seller', label: 'Best Seller' }
]

async function main(params) {
  const logger = Core.Logger('setup-collections', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('setup-collections action invoked')

    const token = await generateAccessToken(params)
    const dbBase = await libDb.init({ token: token.access_token })
    const db = await dbBase.connect()

    for (const name of COLLECTIONS) {
      try {
        await db.createCollection(name)
        logger.info(`Collection created: ${name}`)
      } catch (e) {
        if (e.httpStatusCode === 409) {
          logger.info(`Collection already exists, skipping: ${name}`)
        } else {
          throw e
        }
      }
    }

    const versions = await db.collection('collection_data_versions')
    const catalog = await db.collection('badge_catalog')

    const existing = await versions.findArray({ collection_name: 'badge_catalog' })
    const versionRecord = existing.length > 0 ? existing[0] : null

    if (versionRecord && versionRecord.version === BADGE_CATALOG_VERSION) {
      logger.info(`badge_catalog already at ${BADGE_CATALOG_VERSION}, skipping seed`)
      return {
        statusCode: 200,
        body: { status: 'ok', message: `badge_catalog already at ${BADGE_CATALOG_VERSION}, nothing to do` }
      }
    }

    for (const badge of BADGE_CATALOG) {
      await catalog.insertOne(badge)
    }
    logger.info(`Seeded ${BADGE_CATALOG.length} badges into badge_catalog`)

    const versionEntry = {
      collection_name: 'badge_catalog',
      version: BADGE_CATALOG_VERSION,
      last_inserted: new Date().toISOString()
    }

    if (versionRecord) {
      await versions.updateOne({ collection_name: 'badge_catalog' }, { $set: versionEntry })
    } else {
      await versions.insertOne(versionEntry)
    }

    logger.info(`Version record set to ${BADGE_CATALOG_VERSION}`)

    return {
      statusCode: 200,
      body: {
        status: 'ok',
        collections_created: COLLECTIONS,
        badges_seeded: BADGE_CATALOG.length,
        version: BADGE_CATALOG_VERSION
      }
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
