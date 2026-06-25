// reads a field from product — checks top-level first, then custom_attributes array (Commerce REST format)
function getAttr(product, name) {
  if (product[name] !== undefined && product[name] !== null) return product[name]
  if (Array.isArray(product.custom_attributes)) {
    const found = product.custom_attributes.find(a => a.attribute_code === name)
    return found ? found.value : undefined
  }
  return undefined
}

function evaluateRule(rule, product) {
  const { condition_type, condition_value } = rule

  if (condition_type === 'price_between') {
    const price = parseFloat(getAttr(product, 'price')) || 0
    return price >= condition_value.min && price <= condition_value.max
  }

  if (condition_type === 'discount_pct') {
    const price = parseFloat(getAttr(product, 'price')) || 0
    const specialPrice = parseFloat(getAttr(product, 'special_price')) || 0
    if (!price || !specialPrice) return false
    const discount = ((price - specialPrice) / price) * 100
    return discount >= condition_value.min
  }

  if (condition_type === 'recently_updated') {
    const updatedAt = getAttr(product, 'updated_at')
    if (!updatedAt) return false
    const hoursAgo = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60)
    return hoursAgo <= condition_value.hours
  }

  return false
}

module.exports = { evaluateRule }
