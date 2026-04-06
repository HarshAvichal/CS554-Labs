import { NavLink, Outlet } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link';

export default function AppLayout() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="brand" end>
            Music Library
          </NavLink>
          <nav className="site-nav" aria-label="Main">
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
            <NavLink to="/artists" className={linkClass}>
              Artists
            </NavLink>
            <NavLink to="/albums" className={linkClass}>
              Albums
            </NavLink>
            <NavLink to="/listeners" className={linkClass}>
              Listeners
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}
