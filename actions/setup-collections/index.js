// One-time setup: creates all DB collections and seeds badge_catalog with initial badge definitions.
const { Core } = require('@adobe/aio-sdk')
const libDb = require('@adobe/aio-lib-db')
const { generateAccessToken } = require('../auth')

const COLLECTIONS = ['badge_catalog', 'badge_rules', 'badge_state', 'badge_assignments', 'collection_data_versions']

/*
 * Collections / tables used by the Badge Manager:
 *
 * badge_catalog
 *   Master list of available badges. Created at setup time.
 *   Fields: badge_id (string, unique), label (string), color (hex string), description (string)
 *   Example: { badge_id: "hot_deal", label: "Hot Deal", color: "#e63535", description: "High discount product" }
 *
 * badge_rules
 *   Admin-defined rules that auto-assign badges when a product is saved.
 *   Fields: name, priority (int, lower = higher priority), condition_type (price_between | discount_pct | recently_updated),
 *           condition_value (json object depends on condition_type), badge_id, created_at
 *   Example: { name: "Sale Items", priority: 1, condition_type: "discount_pct", condition_value: { min: 20 }, badge_id: "on_sale" }
 *
 * badge_state
 *   Evaluated badge result per SKU. Written by product-event-consumer on every product.save event.
 *   Fields: sku (unique), badge_id, source ("rule" | "static" | "none"), rule_name, evaluated_at
 *   Example: { sku: "HPC-6006", badge_id: "hot_deal", source: "rule", rule_name: "Sale Items", evaluated_at: ISODate }
 *
 * badge_assignments
 *   Manual by admin, badge override per SKU. Takes effect only when no rule matches.
 *   Fields: sku (unique), badge_id, expires_at (optional), assigned_at
 *   Example: { sku: "HPC-1001", badge_id: "staff_pick", expires_at: null, assigned_at: ISODate }
 *
 * collection_data_versions
 *   Tracks which seed data version has been applied per collection. Prevents duplicate seeding on re-deploy.
 *   Fields: collection_name (unique), version (string e.g. "v1"), applied_at
 *   Example: { collection_name: "badge_catalog", version: "v1", applied_at: given date }
 *   An attempt to create an installer similar to PAAS commerce, this is WIP and required further enhancements
 */

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
