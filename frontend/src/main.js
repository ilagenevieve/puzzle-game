import './assets/styles/main.scss'
import App from './App.svelte'
import logger from './services/logger'
import { handleError } from './services/error-handler'
import { toastStore } from './stores/user-store'

// Set up global error handlers
window.addEventListener('error', (event) => {
  handleError(event.error || new Error(event.message), {
    silent: false,
    showToast: true,
  })
  
  // Prevent default browser error handling
  event.preventDefault()
})

// Handle promise rejections
window.addEventListener('unhandledrejection', (event) => {
  handleError(event.reason || new Error('Unhandled Promise rejection'), {
    silent: false,
    showToast: true,
  })
  
  // Prevent default browser error handling
  event.preventDefault()
})

// Log app startup
logger.info('Application starting', {
  version: import.meta.env.PACKAGE_VERSION || '0.1.0',
  environment: import.meta.env.MODE || 'development'
})

// Initialize toast container
toastStore.init()

// Create the app instance
const app = new App({
  target: document.getElementById('app'),
})

// Log successful mount
logger.info('Application mounted successfully')

export default app