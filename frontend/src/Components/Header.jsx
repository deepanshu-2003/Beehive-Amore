import React, { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import logo from "/digital.png"; // Adjust the path as needed

// Reusable User Dropdown Component
const UserDropdown = ({ isLoggedIn, user = {}, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div className="dropdown me-3 ms-3" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        className={`btn user-btn dropdown-toggle ${isOpen ? 'show' : ''}`}
        type="button"
        id="userDropdown"
        data-bs-toggle="dropdown"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isLoggedIn ? (
          <div className="d-flex align-items-center">
            {imageLoading ? (
              <div className="spinner-border spinner-border-sm text-light me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>

            ) : null}
            <img
              src={user?.profileImg || "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"}
              alt="Profile"
              className="profile-header"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            <span className="ms-2 d-none d-md-inline">{user?.name}</span>
          </div>
        ) : (
          <div className="d-flex align-items-center">
            <i className="fas fa-user-circle me-2"></i>
            <span>{user?.name || "Guest User"}</span>
          </div>
        )}
      </button>
      <ul className={`dropdown-menu user-dropdown ${isOpen ? 'show' : ''}`} aria-labelledby="userDropdown">
        {isLoggedIn ? (
          <>
            <li className="username px-3 py-2">{user?.name || "User"}</li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <Link className="dropdown-item" to="/account">
                <i className="fas fa-user-cog me-2"></i>Account
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/dashboard">
                <i className="fas fa-tachometer-alt me-2"></i>Dashboard
              </Link>
            </li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-2"></i>Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link className="dropdown-item" to="/login">
                <i className="fas fa-sign-in-alt me-2"></i>Login
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/register">
                <i className="fas fa-user-plus me-2"></i>Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

const Header = ({ isLoggedIn, user = {}, handleLogout }) => {
  const location = useLocation();

  // Active Menu Link Check
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="custom-header text-white shadow-sm py-0">
        <nav className="navbar navbar-expand-lg navbar-dark container my-1">
          <button
            className="navbar-toggler me-3"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
          >
            <i className="fas fa-bars"></i>
          </button>
          <Link
            className="navbar-brand fw-bold d-flex align-items-center"
            to="/"
          >
            <img src={logo} alt="Logo" className="logo me-4" />
            <div className="desktop-only">
              <div className="logo-text" style={{fontFamily:"Bell MT", fontSize:"22px", marginTop:"10px"}}><span style={{color:"Gold"}}>BEE</span>H!VE AMORE</div>
            </div>
          </Link>

          <div
            className="offcanvas offcanvas-start"
            id="offcanvasNavbar"
            data-bs-scroll="true"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title">Beehive Amore</h5>
              <button
                className="btn-close unique-close-button"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              >
                <i className="fas fa-times-circle"></i>
              </button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav ms-auto">
                {["Home", "Services", "Courses", "About", "Contact"].map(
                  (menu) => (
                    <li className="nav-item" key={menu}>
                      <Link
                        className={`nav-link fw-semibold ${
                          isActive(`/${menu.toLowerCase()}`) ? "active" : ""
                        }`}
                        to={`/${menu.toLowerCase()}`}
                      >
                        {menu}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          <UserDropdown
            isLoggedIn={isLoggedIn}
            user={user}
            handleLogout={handleLogout}
          />
        </nav>
      </header>
    </>
  );
};

export default Header;
