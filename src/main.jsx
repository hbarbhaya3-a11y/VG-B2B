import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', color: '#c0392b' }}>
          <h2>Runtime Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css'
import '@mantine/dates/styles.css'

import App from './App'
import { theme } from './theme'
import { UseCaseProvider } from './contexts/UseCaseContext'
import { ConversationProvider } from './contexts/ConversationContext'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <ModalsProvider>
        <Notifications position="top-right" />
        <AuthProvider>
          <ToastProvider>
            <ConversationProvider>
              <UseCaseProvider>
                <App />
              </UseCaseProvider>
            </ConversationProvider>
          </ToastProvider>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>
  </ErrorBoundary>
)
