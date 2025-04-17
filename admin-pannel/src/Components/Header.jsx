import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import logo from "/logo192.png";
import "./Header.css";

// Reusable User Dropdown Component
const UserDropdown = () => {
  const { isLoggedIn, user, handleLogout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dropdown me-3">
      <button
        className="btn user-btn dropdown-toggle"
        type="button"
        id="userDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-haspopup="true"
      >
        {isLoggedIn ? (
          <img
            src={user.profileImg || "https://via.placeholder.com/150"}
            alt="Profile"
            className="profile-header"
          />
        ) : (
          user.name
        )}
      </button>
      <ul className="dropdown-menu user-dropdown" aria-labelledby="userDropdown">
        {isLoggedIn ? (
          <>
            <li className="username">{user.name}</li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <Link className="dropdown-item" to="/dashboard">
                Dashboard
              </Link>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => {
                  handleLogout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link className="dropdown-item" to="/login">
              Login Now
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

const Header = () => {
  const location = useLocation();

  // Active Menu Link Check
  const isActive = (path) => location.pathname === path;

  return (
    <header className="custom-header text-white shadow-sm py-0">
      <nav className="navbar navbar-expand-lg navbar-dark container my-1">
        {/* Offcanvas Navigation */}
        <button
          className="navbar-toggler me-3"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
        >
          <i className="fas fa-bars"></i> {/* Font Awesome Icon */}
        </button>
        <Link
          className="navbar-brand fw-bold d-flex align-items-center"
          to="/"
        >
          <img src={logo} alt="Logo" className="logo me-2" /> Beehive Amore
        </Link>
        {/* Offcanvas Menu */}
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
              {/* Font Awesome Close Icon */}
            </button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav ms-auto">
              {["Home", "Courses"].map((menu) => (
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
              ))}
            </ul>
          </div>
        </div>
        {/* User Section */}
        <UserDropdown />
      </nav>
    </header>
  );
};

export default Header;
