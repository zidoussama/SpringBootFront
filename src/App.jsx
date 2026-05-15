import { useEffect, useState } from 'react'
import Login from './Auth/Login'
import Register from './Auth/Register'
import ClientHome from './clients/home'
import AdminHome from './admin/home'
import  QualiterHome from './qualiter/home'

const routes = {
  '/login': Login,
  '/register': Register,
  '/qualite': QualiterHome,
  '/admin': AdminHome,
  '/client': ClientHome,
}

function getCurrentPath() {
  const { pathname } = window.location
  if (pathname === '/' || pathname === '') return '/login'
  return routes[pathname] ? pathname : '/login'
}

function App() {
  const [path, setPath] = useState(getCurrentPath)

  useEffect(() => {
    const handlePopState = () => setPath(getCurrentPath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const ActiveScreen = routes[path] ?? Login

  const navigate = (nextPath) => {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  const clearAuthCookies = () => {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  }

  const handleLogout = () => {
    clearAuthCookies()
    navigate('/login')
  }
return (
    <div>
      <ActiveScreen onNavigate={navigate} onLogout={handleLogout} />
    </div>
  )

}

export default App