import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faGraduationCap, 
  faBook, 
  faClock, 
  faCalendarAlt, 
  faCheckCircle, 
  faExclamationCircle,
  faInbox,
  faEye,
  faTrash,
  faBriefcase,
  faBuilding,
  faMapMarkerAlt,
  faFileAlt,
  faHourglassHalf
} from '@fortawesome/free-solid-svg-icons';
import ChatWidget from './ChatWidget';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState({
    courses: true,
    notifications: true,
    placements: true
  });
  const [error, setError] = useState({
    courses: null,
    notifications: null,
    placements: null
  });
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    // Get user data from localStorage
    // In AuthContext, the user's name is stored directly as a string, not as a JSON object
    const userName = localStorage.getItem('user') || 'User';
    const profileImg = localStorage.getItem('profile_img') || null;
    
    setCurrentUser({
      name: userName,
      profileImg: profileImg
    });
    
    // Fetch dashboard overview data
    const fetchDashboardOverview = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/dashboard/overview`,
          { headers: { auth_token: token } }
        );

        if (response.data.success) {
          console.log('Dashboard overview:', response.data);
          // You can use this data to show counts or other summary information
        }
      } catch (error) {
        console.error('Error fetching dashboard overview:', error);
      }
    };
    
    // Fetch user's purchased courses
    const fetchCourses = async () => {
      try {
        setLoading(prev => ({ ...prev, courses: true }));
        setError(prev => ({ ...prev, courses: null }));
        
        const token = localStorage.getItem('auth_token') || null;
        if (!token) {
          setError(prev => ({ ...prev, courses: 'Authentication required' }));
          setLoading(prev => ({ ...prev, courses: false }));
          return;
        }
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/dashboard/courses`,
          {headers: { auth_token: token } }
        );
        
        if (response.data.success) {
          setCourses(response.data.courses);
        } else {
          setError(prev => ({ ...prev, courses: 'Failed to load courses' }));
        }
        
        setLoading(prev => ({ ...prev, courses: false }));
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError(prev => ({ 
          ...prev, 
          courses: error.response?.data?.error || 'Failed to load courses. Please try again.' 
        }));
        setLoading(prev => ({ ...prev, courses: false }));
      }
    };

    // Fetch user notifications
    const fetchNotifications = async () => {
      try {
        setLoading(prev => ({ ...prev, notifications: true }));
        setError(prev => ({ ...prev, notifications: null }));
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError(prev => ({ ...prev, notifications: 'Authentication required' }));
          setLoading(prev => ({ ...prev, notifications: false }));
          return;
        }
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/dashboard/notifications`,
          { headers: { auth_token: token } }
        );
        
        if (response.data.success) {
          setNotifications(response.data.notifications);
        } else {
          setError(prev => ({ ...prev, notifications: 'Failed to load notifications' }));
        }
        
        setLoading(prev => ({ ...prev, notifications: false }));
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError(prev => ({ 
          ...prev, 
          notifications: error.response?.data?.error || 'Failed to load notifications. Please try again.' 
        }));
        setLoading(prev => ({ ...prev, notifications: false }));
      }
    };

    // Fetch user's applied placements
    const fetchPlacements = async () => {
      try {
        setLoading(prev => ({ ...prev, placements: true }));
        setError(prev => ({ ...prev, placements: null }));
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError(prev => ({ ...prev, placements: 'Authentication required' }));
          setLoading(prev => ({ ...prev, placements: false }));
          return;
        }
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/dashboard/placements`,
          { headers: { auth_token: token } }
        );
        
        if (response.data.success) {
          setPlacements(response.data.placements);
        } else {
          setError(prev => ({ ...prev, placements: 'Failed to load placements' }));
        }
        
        setLoading(prev => ({ ...prev, placements: false }));
      } catch (error) {
        console.error('Error fetching placements:', error);
        setError(prev => ({ 
          ...prev, 
          placements: error.response?.data?.error || 'Failed to load placement opportunities. Please try again.' 
        }));
        setLoading(prev => ({ ...prev, placements: false }));
      }
    };

    fetchDashboardOverview();
    fetchCourses();
    fetchNotifications();
    fetchPlacements();
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard/notifications/${notificationId}/read`,
        {},
        { headers: { auth_token: token } }
      );
      
      if (response.data.success) {
        // Update the notification in the state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true } 
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard/notifications/read-all`,
        {},
        { headers: { auth_token: token } }
      );
      
      if (response.data.success) {
        // Update all notifications to read in the local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard/notifications/${notificationId}`,
        { headers: { auth_token: token } }
      );
      
      if (response.data.success) {
        // Remove the notification from the state
        setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Calculate the number of unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <>
    <Container fluid className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {currentUser?.name || 'User'}!</p>
      </div>

      <div className="dashboard-grid">
        {/* Main Content - Purchased Courses and Placements */}
        <div>
          <Card className="dashboard-card mb-4">
            <div className="dashboard-card-header">
              <h2>
                <FontAwesomeIcon icon={faGraduationCap} />
                My Courses
              </h2>
              <Link to="/courses" className="btn btn-outline-primary btn-sm">
                Browse More Courses
              </Link>
            </div>
            <div className="dashboard-card-body">
              {loading.courses ? (
                <div className="loading-spinner">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : error.courses ? (
                <Alert variant="danger">{error.courses}</Alert>
              ) : courses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FontAwesomeIcon icon={faBook} />
                  </div>
                  <p className="empty-state-text">You haven't purchased any courses yet.</p>
                  <Link to="/courses" className="btn btn-primary">
                    Explore Courses
                  </Link>
                </div>
              ) : (
                <div className="course-list">
                  {courses.map(course => (
                    <div key={course.id} className="course-item">
                      <div className="course-image">
                        <img src={course.course_img || 'https://via.placeholder.com/300x160'} alt={course.course_name} />
                      </div>
                      <div className="course-details">
                        <h3 className="course-title">{course.course_name}</h3>
                        <div className="course-info">
                          <span>
                            <FontAwesomeIcon icon={faClock} /> {course.course_duration || 'N/A'}
                          </span>
                          <span>
                            <FontAwesomeIcon icon={faCalendarAlt} /> 
                            Purchased: {new Date(course.purchaseDate).toLocaleDateString()}
                          </span>
                          <span>
                            <FontAwesomeIcon icon={faHourglassHalf} /> 
                            Expires: {new Date(course.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="course-actions">
                          <span className={`course-status ${course.completed ? 'status-completed' : 'status-active'}`}>
                            {course.completed ? (
                              <>
                                <FontAwesomeIcon icon={faCheckCircle} /> Completed
                              </>
                            ) : (
                              <></>
                            )}
                          </span>
                          <Link to={`/courses/${course.id}`} className="btn btn-sm btn-primary">
                            {course.completed ? 'Review' : 'Continue'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar - Notifications */}
        <div>
          <Card className="dashboard-card">
            <div className="dashboard-card-header">
              <h2>
                <FontAwesomeIcon icon={faBell} />
                Notifications
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </h2>
            </div>
            <div className="dashboard-card-body">
              {loading.notifications ? (
                <div className="loading-spinner">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : error.notifications ? (
                <Alert variant="danger">{error.notifications}</Alert>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FontAwesomeIcon icon={faInbox} />
                  </div>
                  <p className="empty-state-text">You don't have any notifications yet.</p>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.important ? 'important' : ''}`}
                    >
                      <div className="notification-header">
                        <div className="notification-title">
                          {notification.important && (
                            <FontAwesomeIcon icon={faExclamationCircle} color="#dc3545" />
                          )}
                          {notification.title}
                        </div>
                        <div className="notification-time">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="notification-content">
                        {notification.message}
                      </div>
                      <div className="notification-actions">
                        {!notification.read && (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <FontAwesomeIcon icon={faEye} /> Mark as Read
                          </Button>
                        )}
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="dashboard-card-footer">
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => {
                    // Mark all as read
                    notifications.forEach(notification => {
                      if (!notification.read) {
                        markNotificationAsRead(notification.id);
                      }
                    });
                  }}
                >
                  Mark all as read
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Main Column - Placements Section */}
        <div>
          <Card className="dashboard-card mb-4">
            <div className="dashboard-card-header">
              <h2>
                <FontAwesomeIcon icon={faBriefcase} />
                Applied Placements
              </h2>
              <Link to="/placements" className="btn btn-outline-primary btn-sm">
                Browse More Opportunities
              </Link>
            </div>
            <div className="dashboard-card-body">
              {loading.placements ? (
                <div className="loading-spinner">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : error.placements ? (
                <Alert variant="danger">{error.placements}</Alert>
              ) : placements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FontAwesomeIcon icon={faBuilding} />
                  </div>
                  <p className="empty-state-text">You haven't applied to any placements yet.</p>
                  <Link to="/placements" className="btn btn-primary">
                    Explore Opportunities
                  </Link>
                </div>
              ) : (
                <div className="placement-list">
                  {placements.map(placement => (
                    <div key={placement.id} className="placement-item">
                      <div className="placement-logo">
                        <img src={placement.logo} alt={placement.company} />
                      </div>
                      <div className="placement-details">
                        <h3 className="placement-title">{placement.position}</h3>
                        <div className="placement-company">
                          <FontAwesomeIcon icon={faBuilding} /> {placement.company}
                        </div>
                        <div className="placement-info">
                          <span>
                            <FontAwesomeIcon icon={faMapMarkerAlt} /> {placement.location}
                          </span>
                          <span>
                            <FontAwesomeIcon icon={faCalendarAlt} /> Applied: {new Date(placement.appliedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="placement-status-container">
                        <div className={`placement-status status-${placement.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {placement.status === 'Applied' && <FontAwesomeIcon icon={faFileAlt} />}
                          {placement.status === 'Under Review' && <FontAwesomeIcon icon={faHourglassHalf} />}
                          {placement.status === 'Interview Scheduled' && <FontAwesomeIcon icon={faCalendarAlt} />}
                          {placement.status}
                        </div>
                        <Link to={`/placements/${placement.id}`} className="btn btn-sm btn-outline-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Container>
    <ChatWidget />
    </>
  );
};

export default Dashboard;
