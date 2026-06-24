import React from 'react'
import { Provider, defaultTheme } from '@adobe/react-spectrum'
import ErrorBoundary from 'react-error-boundary'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import SideBar from './SideBar'
import BadgeRules from './BadgeRules'
import StaticAssignments from './StaticAssignments'
import Monitor from './Monitor'

function App (props) {
  props.runtime.on('configuration', ({ imsOrg, imsToken, locale }) => {
    console.log('configuration change', { imsOrg, imsToken, locale })
  })
  props.runtime.on('history', ({ type, path }) => {
    console.log('history change', { type, path })
  })

  return (
    <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
      <Router>
        <Provider theme={defaultTheme} colorScheme={'light'}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <SideBar />
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f8f8' }}>
              <Routes>
                <Route path='/' element={<BadgeRules />} />
                <Route path='/assignments' element={<StaticAssignments />} />
                <Route path='/monitor' element={<Monitor />} />
              </Routes>
            </div>
          </div>
        </Provider>
      </Router>
    </ErrorBoundary>
  )

  function onError (e, componentStack) { }

  function fallbackComponent ({ componentStack, error }) {
    return (
      <React.Fragment>
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Something went wrong :(</h1>
        <pre>{componentStack + '\n' + error.message}</pre>
      </React.Fragment>
    )
  }
}

export default App
