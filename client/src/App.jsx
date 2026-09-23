import { Routes, Route } from 'react-router-dom'
import HomeScreen from './pages/HomeScreen.jsx'
import MissionScreen from './pages/MissionScreen.jsx'
import ResultScreen from './pages/ResultScreen.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/mission/:missionId" element={<MissionScreen />} />
      <Route path="/mission/:missionId/result" element={<ResultScreen />} />
    </Routes>
  )
}
