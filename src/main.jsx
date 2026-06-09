import React from 'react'
import { createRoot } from 'react-dom/client'
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
)
