import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';

const Navbar = () => {
  const [isNavActive, setIsNavActive] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isScrolled, setIsScrolled] = useState(false); // New state for scroll detection
  const navbarRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Fetch userRole from localStorage on mount
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');
  }, []);

  useEffect(() => {
    // Handle scroll event to toggle navbar background
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Handle click outside to close mobile menu
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsNavActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  const handleLinkClick = () => {
    setIsNavActive(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserRole('');
    window.location.href = '/login';
  };

  const renderNavLinks = () => {
    const isActiveLink = (path) => (location.pathname === path ? 'active' : '');

    if (!userRole) {
      return (
        <>
          <li style={{ '--i': 1 }}>
            <Link to="/" className={isActiveLink('/')} onClick={handleLinkClick}>
              <b>Home</b>
            </Link>
          </li>
          <li style={{ '--i': 2 }}>
            <Link to="/salon" className={isActiveLink('/salon')} onClick={handleLinkClick}>
              <b>Salon</b>
            </Link>
          </li>
          <li style={{ '--i': 3 }}>
            <Link to="/beauty" className={isActiveLink('/beauty')} onClick={handleLinkClick}>
              <b>Beauty</b>
            </Link>
          </li>
          <li style={{ '--i': 4 }}>
            <Link to="/skincare" className={isActiveLink('/skincare')} onClick={handleLinkClick}>
              <b>Doctor</b>
            </Link>
          </li>
          <li style={{ '--i': 5 }}>
            <Link to="/login" className={isActiveLink('/login')} onClick={handleLinkClick}>
              <b>Login</b>
            </Link>
          </li>
        </>
      );
    }

    switch (userRole) {
      case 'Admin':
        return (
          <>
            <li style={{ '--i': 1 }}>
              <Link to="/users" className={isActiveLink('/users')} onClick={handleLinkClick}>
                Users
              </Link>
            </li>
            <li style={{ '--i': 2 }}>
              <Link
                to="/serviceProviders"
                className={isActiveLink('/serviceProviders')}
                onClick={handleLinkClick}
              >
                Providers
              </Link>
            </li>
            <li style={{ '--i': 3 }}>
              <Link
                to="/bookingDetails"
                className={isActiveLink('/bookingDetails')}
                onClick={handleLinkClick}
              >
                Bookings
              </Link>
            </li>
            <li style={{ '--i': 4 }}>
              <Link to="/revenue" className={isActiveLink('/revenue')} onClick={handleLinkClick}>
                Revenue
              </Link>
            </li>
            <li style={{ '--i': 5 }}>
              <Link
                to="/approvals"
                className={isActiveLink('/approvals')}
                onClick={handleLinkClick}
              >
                Approvals
              </Link>
            </li>
            <li style={{ '--i': 6 }}>
              <Link
                to="/complaints"
                className={isActiveLink('/complaints')}
                onClick={handleLinkClick}
              >
                Complaints
              </Link>
            </li>
            <li style={{ '--i': 7 }}>
              <Link
                to="/login"
                onClick={() => {
                  handleLogout();
                  handleLinkClick();
                }}
              >
                <b style={{ color: 'red' }}>Logout</b>
              </Link>
            </li>
          </>
        );

      case 'ServiceProvider':
        return (
          <>
            <li style={{ "--i": 1 }}>
              <Link
                to="/services"
                className={isActiveLink("/services")}
                onClick={handleLinkClick}
              >
                Add Service
              </Link>
            </li>
            <li style={{ "--i": 2 }}>
              <Link
                to="/AddEmployee"
                className={isActiveLink("/AddEmployee")}
                onClick={handleLinkClick}
              >
                Emp Management
              </Link>
            </li>
            <li style={{ "--i": 3 }}>
              <Link
                to="/SpBookingDetails"
                className={isActiveLink("/SpBookingDetails")}
                onClick={handleLinkClick}
              >
                Bookings
              </Link>
            </li>
            <li style={{ "--i": 4 }}>
              <Link
                to="/SPpaymentDetails"
                className={isActiveLink("/SPpaymentDetails")}
                onClick={handleLinkClick}
              >
                Payments
              </Link>
            </li>
            <li style={{ "--i": 5 }}>
              <Link
                to="/Enquiries"
                className={isActiveLink("/Enquiries")}
                onClick={handleLinkClick}
              >
                Enquiries
              </Link>
            </li>
            <li style={{ "--i": 6 }}>
              <Link
                to="/login"
                onClick={() => {
                  handleLogout();
                  handleLinkClick();
                }}
              >
                <b style={{ color: "red" }}>Logout</b>
              </Link>
            </li>
          </>
        );

      case 'User':
        return (
          <>
            <li style={{ "--i": 1 }}>
              <Link
                to="/"
                className={isActiveLink("/")}
                onClick={handleLinkClick}
              >
                <b>Home</b>
              </Link>
            </li>
            <li style={{ "--i": 2 }}>
              <Link
                to="/salon"
                className={isActiveLink("/salon")}
                onClick={handleLinkClick}
              >
                <b>Salon</b>
              </Link>
            </li>
            <li style={{ "--i": 3 }}>
              <Link
                to="/beauty"
                className={isActiveLink("/beauty")}
                onClick={handleLinkClick}
              >
                <b>Beauty</b>
              </Link>
            </li>
            <li style={{ "--i": 4 }}>
              <Link
                to="/skincare"
                className={isActiveLink("/skincare")}
                onClick={handleLinkClick}
              >
                <b>Doctor</b>
              </Link>
            </li>
            <li style={{ "--i": 5 }}>
              <Link
                to="/bookings"
                className={isActiveLink("/bookings")}
                onClick={handleLinkClick}
              >
                <b>Bookings</b>
              </Link>
            </li>

            <li style={{ "--i": 6 }}>
              <Link
                to="/UserEnquiries"
                className={isActiveLink("/UserEnquiries")}
                onClick={handleLinkClick}
              >
                <b>Enquiries</b>
              </Link>
            </li>
            <li style={{ "--i": 7 }}>
              <Link
                to="/login"
                onClick={() => {
                  handleLogout();
                  handleLinkClick();
                }}
              >
                <b style={{ color: "red" }}>Logout</b>
              </Link>
            </li>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <nav
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 10,
      }}
      ref={navbarRef}
    >
      <div className="navbar-logo">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#36257d', fontStyle: 'Cursive' }}>BeautyBliss</h1>
        </Link>
      </div>
      <button className="navbar-toggle" onClick={toggleNav}>
        ☰
      </button>
      <ul className={`navbar-links ${isNavActive ? 'active' : ''}`}>
        {renderNavLinks()}
      </ul>
    </nav>
  );
};

export default Navbar;
