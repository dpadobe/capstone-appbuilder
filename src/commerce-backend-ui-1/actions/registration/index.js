// Registration action: tells Commerce Admin what menu section and item to add in the left nav for this app.
'use strict'

const menuSectionId = 'badge_manager::apps'
const menuItemId = 'badge_manager::admin'

async function main () {
  return {
    statusCode: 200,
    body: {
      registration: {
        menuItems: [
          {
            id: menuSectionId,
            title: 'Badge Manager',
            isSection: true,
            sortOrder: 110
          },
          {
            id: menuItemId,
            title: 'Badge Admin',
            parent: menuSectionId,
            sortOrder: 1
          }
        ],
        page: {
          title: 'Badge Admin'
        }
      }
    }
  }
}

exports.main = main
