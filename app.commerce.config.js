'use strict'

module.exports = {
  metadata: {
    id: 'badge-manager',
    displayName: 'Badge Manager',
    description: 'Product badge manager for EDS storefront PDP',
    version: '1.0.0'
  },
  adminUiSdk: {
    registration: {
      menuItems: [
        {
          id: 'badge_manager::apps',
          title: 'Badge Manager',
          isSection: true,
          sortOrder: 110
        },
        {
          id: 'badge_manager::admin',
          title: 'Badge Admin',
          parent: 'badge_manager::apps',
          sortOrder: 1
        }
      ]
    }
  },
  businessConfig: {
    schema: [
      {
        name: 'placeholder',
        label: 'Placeholder',
        type: 'text',
        default: ''
      }
    ]
  }
}
