
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { Toaster } from './components/ui/toaster'
import './i18n/config' // Initialize i18n

// Set light mode as default
// Theme will be set by ThemeToggle component based on localStorage or default to light

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
        <Toaster/>
    </Provider>
  </BrowserRouter>,
)
