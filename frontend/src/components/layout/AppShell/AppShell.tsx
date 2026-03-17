import { Outlet } from 'react-router-dom'
import './AppShell.css'

function AppShell({ sidebar, header, footer, children }) {
  const hasAuth = !sidebar
  const hasSidebar = !!sidebar

  return (
    <div className={`app-shell ${hasAuth ? 'auth' : ''} ${hasSidebar ? 'with-sidebar' : ''}`}>
      {sidebar && (
        <aside className="sidebar">
          {sidebar}
        </aside>
      )}

      <header className="header">
        {header}
      </header>

      <main>
        {children || <Outlet />}
      </main>

      <footer className="footer">
        {footer}
      </footer>
    </div>
  )
}

export default AppShell
