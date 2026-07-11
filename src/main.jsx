import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { PwaProvider } from './context/PwaContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <PwaProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </PwaProvider>
    </HashRouter>
  </StrictMode>,
)
