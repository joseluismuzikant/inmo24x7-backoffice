import Sidebar from './Sidebar'
import UserBadge from './UserBadge'
import { useAuth } from '../context/AuthContext'
import '../styles/Layout.css'

const Layout = ({ children }) => {
  const { profile } = useAuth()
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="layout-main">
        <header className="flex justify-end border-b p-4">
          <UserBadge profile={profile} />
        </header>
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
