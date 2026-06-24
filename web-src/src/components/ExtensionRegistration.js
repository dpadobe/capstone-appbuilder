// Registers this app with the Commerce Admin Shell so it appears as a left-nav menu item.
import { register } from '@adobe/uix-guest'
import { useEffect } from 'react'

const EXTENSION_ID = 'badge_manager'

export default function ExtensionRegistration (props) {
  useEffect(() => {
    (async () => {
      await register({ id: EXTENSION_ID, methods: {} })
    })()
  }, [])

  // Renders nothing — registration is a side effect only.
  return null
}
