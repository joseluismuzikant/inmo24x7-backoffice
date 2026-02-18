import Sidebar from './Sidebar'
import '../styles/Layout.css'

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="layout-main">
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
