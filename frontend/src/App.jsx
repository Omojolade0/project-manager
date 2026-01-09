import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'


function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </main>
  )
}

export default App
