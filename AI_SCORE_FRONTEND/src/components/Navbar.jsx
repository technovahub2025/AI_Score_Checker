import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          AI Score
        </Link>
        <nav className="nav-links">
          <NavLink to="/scan" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Scan
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            History
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
