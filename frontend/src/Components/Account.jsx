import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Account.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheckCircle, 
  faTimesCircle, 
  faEdit,
  faEnvelope,
  faPhone,
  faBriefcase,
  faMapMarkerAlt,
  faUser,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import Footer from "./Footer";

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/get-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              auth_token: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading your profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error: {error}</p>
        <button onClick={() => navigate("/login")} className="error-button">
          Return to Login
        </button>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const imageUrl = `${import.meta.env.VITE_BACKEND_URL}/general/image-proxy?url=${encodeURIComponent(user.profile_img)}`;

  const handleEditProfile = () => {
    // Implement edit profile functionality
    console.log("Edit profile clicked");
  };

  const handleEditAvatar = () => {
    // Implement avatar edit functionality
    console.log("Edit avatar clicked");
  };

  return (
    <div className="page-wrapper">
      <div className="profile-page">
        <div className="account-container">
          <div className="profile-header-section">
            <div className="back-nav">
              <button className="back-nav-button" onClick={() => navigate(-1)}>
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Back</span>
              </button>
            </div>
            <div className="profile-cover"></div>
            <div className="profile-avatar-container">
              <img
                src={imageUrl}
                alt="Profile"
                className="profile-avatar"
                onError={(e) => {
                  e.target.src = '/default-avatar.png'; // Add a default avatar image
                }}
              />
              <div className="edit-avatar" onClick={handleEditAvatar}>
                <FontAwesomeIcon icon={faEdit} />
              </div>
            </div>
            <h1 className="profile-name">
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : "Update Your Name"}
            </h1>
            <p className="profile-username">@{user.username || "username"}</p>
          </div>

          <div className="profile-cards-container">
            <div className="profile-card basic-info">
              <h3 className="card-title">Basic Information</h3>
              <div className="info-item">
                <FontAwesomeIcon icon={faUser} className="info-icon" />
                <div className="info-content">
                  <label>Username</label>
                  <p>{user.username || "Not set"}</p>
                </div>
              </div>

              <div className="info-item">
                <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                <div className="info-content">
                  <label>Email</label>
                  <p>
                    {user.email || "Not provided"}
                    {user.email_verified ? (
                      <FontAwesomeIcon icon={faCheckCircle} className="verified-icon" title="Verified" />
                    ) : (
                      <FontAwesomeIcon icon={faTimesCircle} className="not-verified-icon" title="Not Verified" />
                    )}
                  </p>
                </div>
              </div>

              <div className="info-item">
                <FontAwesomeIcon icon={faBriefcase} className="info-icon" />
                <div className="info-content">
                  <label>Profession</label>
                  <p>{user.profession || "Not specified"}</p>
                </div>
              </div>

              <div className="info-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="info-icon" />
                <div className="info-content">
                  <label>Location</label>
                  <p>{[user.city, user.state, user.country].filter(Boolean).join(", ") || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
