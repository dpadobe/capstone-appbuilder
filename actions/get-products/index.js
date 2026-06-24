// Proxies Commerce REST to return product list (sku, name) for Admin UI dropdowns; required to avoid browser CORS restrictions.
const { Core } = require('@adobe/aio-sdk')
const fetch = require('node-fetch')
const { generateAccessToken } = require('../auth')

async function main(params) {
  const logger = Core.Logger('get-products', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('get-products action invoked')

    const token = await generateAccessToken(params)

    const url = `${params.COMMERCE_API_BASE_URL}/V1/products?searchCriteria[pageSize]=100&fields=items[sku,name]`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'x-api-key': params.IMS_OAUTH_S2S_CLIENT_ID,
        'x-gw-ims-org-id': params.IMS_OAUTH_S2S_ORG_ID
      }
    })

    if (!response.ok) {
      throw new Error(`Commerce products fetch failed: ${response.status}`)
    }

    const data = await response.json()
    const products = data.items.map(p => ({ sku: p.sku, name: p.name }))

    return {
      statusCode: 200,
      body: { status: 'ok', count: products.length, products }
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
