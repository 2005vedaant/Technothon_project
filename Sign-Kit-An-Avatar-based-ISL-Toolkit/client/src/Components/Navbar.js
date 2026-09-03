import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../Assets/logo.png';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const currentPath = location.pathname;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isAuthenticated || currentPath === '/login') {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    // Helper to render links matching exact route paths
    const renderNavLink = (path, label) => {
        const isActive = currentPath === path;
        return (
            <li className="nav-item px-1">
                <Link
                    to={path}
                    className={`btn btn-sm px-3 py-2 fw-bold transition-all rounded-pill text-decoration-none ${
                        isActive 
                            ? 'btn-info text-dark shadow-sm' 
                            : 'text-light opacity-75 hover-opacity-100'
                    }`}
                    style={{
                        fontSize: '0.9rem',
                        border: isActive ? 'none' : '1px solid transparent'
                    }}
                >
                    {label}
                </Link>
            </li>
        );
    };

    return (
        <nav className={`navbar navbar-expand-lg fixed-top py-3 transition-all ${scrolled ? 'shadow' : ''}`}>
            <div className="container px-4 px-lg-5">
            
<Link to="/home" className="navbar-brand d-flex align-items-center mb-0 h1 text-decoration-none">
    <img src={logo} width="32" height="32" className="d-inline-block align-top me-3 shadow-sm" alt="Logo" style={{ borderRadius: '8px' }} />
    <span style={{ fontWeight: '800', letterSpacing: '-0.5px', fontSize: '1.25rem', color: 'var(--text-main)' }}>
      Mitra AI
    </span>
</Link>
                
                <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    <i className="fa fa-bars text-light"></i>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarResponsive">
                    <ul className="navbar-nav ms-auto my-2 my-lg-0 fw-semibold align-items-center gap-1">
                        {renderNavLink('/home', 'Home')}
                        {renderNavLink('/convert', 'Audio to Sign')}
                        {renderNavLink('/sign-to-text', 'Sign to Text (AI)')}
                        {renderNavLink('/learn', 'Learn')}
                        {renderNavLink('/feedback', 'Feedback')}

                        <li className="nav-item px-1 ms-lg-2 mt-3 mt-lg-0">
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline-danger btn-sm px-3 py-2 fw-bold shadow-sm rounded-pill d-inline-flex align-items-center"
                                title="Sign Out"
                            >
                                <i className="fa fa-sign-out me-1"></i>
                                <span>Logout</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;