import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'


function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </main>
  )
}

export default App
