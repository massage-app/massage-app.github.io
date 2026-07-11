import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Inicio from './pages/Inicio.jsx'
import Convocantes from './pages/Convocantes.jsx'
import Turnos from './pages/Turnos.jsx'
import Caja from './pages/Caja.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="convocantes" element={<Convocantes />} />
        <Route path="turnos" element={<Turnos />} />
        <Route path="caja" element={<Caja />} />
      </Route>
    </Routes>
  )
}
