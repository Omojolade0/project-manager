import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ProjectList from './pages/ProjectList'
import ProjectCard from './components/ProjectCard'
import TaskCard from './components/TaskCard'
import TaskModal from './components/TaskModal'
import ProjectModal from './components/ProjectModal'
import Dashboard from './pages/Dashboard'


function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProjectList />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </main>
  )
}

export default App
