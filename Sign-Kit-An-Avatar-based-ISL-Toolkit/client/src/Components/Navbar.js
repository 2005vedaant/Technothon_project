import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../Assets/logo.png'

function Navbar() {
    const location = useLocation();
    const currentPath = location.pathname;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar navbar-expand-lg fixed-top py-3 transition-all ${scrolled ? 'shadow' : ''}`}>
            <div className="container px-4 px-lg-5">
                <Link to='/sign-kit/home' className="navbar-brand d-flex align-items-center mb-0 h1 text-decoration-none">
                    <img src={logo} width="32" height="32" className="d-inline-block align-top me-3 shadow-sm" alt="Logo" style={{ borderRadius: '8px' }} />
                    <span style={{ fontWeight: '800', letterSpacing: '-0.5px', fontSize: '1.25rem', color: 'var(--text-main)' }}>Sign Kit</span>
                </Link>
                <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    <i className="fa fa-bars text-light"></i>
                </button>
                <div className="collapse navbar-collapse" id="navbarResponsive">
                    <ul className="navbar-nav ms-auto my-2 my-lg-0 fw-semibold align-items-center">
                        <li className="nav-item px-1">
                            <Link to='/sign-kit/home' className={`nav-link px-3 rounded-pill transition-all ${currentPath.includes('/home') ? 'active-link bg-white bg-opacity-10' : ''}`}>Home</Link>
                        </li>
                        <li className="nav-item px-1">
                            <Link to='/sign-kit/convert' className={`nav-link px-3 rounded-pill transition-all ${currentPath.includes('/convert') ? 'active-link bg-white bg-opacity-10' : ''}`}>Audio to Sign</Link>
                        </li>
                        <li className="nav-item px-1">
                            <Link to='/sign-kit/sign-to-text' className={`nav-link px-3 rounded-pill transition-all ${currentPath.includes('/sign-to-text') ? 'active-link bg-white bg-opacity-10' : ''}`}>Sign to Text (AI)</Link>
                        </li>
                        <li className="nav-item px-1">
                            <Link to='/sign-kit/learn-sign' className={`nav-link px-3 rounded-pill transition-all ${currentPath.includes('/learn-sign') ? 'active-link bg-white bg-opacity-10' : ''}`}>Learn</Link>
                        </li>
                        <li className="nav-item px-1 ms-lg-3 mt-3 mt-lg-0">
                            <Link to='/sign-kit/feedback' className="btn btn-info btn-sm px-4 py-2 fw-bold text-dark shadow-sm rounded-pill">Feedback</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
