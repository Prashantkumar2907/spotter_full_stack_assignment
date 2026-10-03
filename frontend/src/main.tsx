import '@fontsource-variable/overpass'
import '@fontsource-variable/public-sans'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/patrick-hand/400.css'
import './theme/mantineStyles'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { warmUpApi } from './api/client'
import App from './App'
import { AppProviders } from './theme/AppProviders'
import './styles/tokens.css'
import './styles/global.css'
import './styles/map.css'
import './styles/sheet.css'
import './styles/truck.css'

warmUpApi()

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root was not found')

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
