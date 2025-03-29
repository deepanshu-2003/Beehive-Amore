import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Header from "./Header";
import CreateCourse from "./CreateCourse";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import "./Courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const handleModalOpen = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/course/get/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <>
        {[...Array(fullStars)].map((_, index) => (
          <i key={index} className="fas fa-star text-warning"></i>
        ))}
        {halfStar && <i className="fas fa-star-half-alt text-warning"></i>}
        {[...Array(emptyStars)].map((_, index) => (
          <i key={index} className="far fa-star text-warning"></i>
        ))}
      </>
    );
  };

  const filteredCourses = courses
    .filter((course) =>
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.course_price - a.course_discount) - (b.course_price - b.course_discount);
        case "price-high":
          return (b.course_price - b.course_discount) - (a.course_price - a.course_discount);
        case "rating":
          return b.averageRating - a.averageRating;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <>
        <Header />
        <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="courses-page">
        <div className="container">
          <div className="courses-header text-center mb-5">
            <h1 className="display-4 text-primary fw-bold mb-3">Our Courses</h1>
            <p className="text-muted lead mb-4">Manage and explore our professional courses</p>
            
            {/* Centered Create Course Button */}
            <div className="text-center mb-4">
              <Button
                className="btn btn-primary create-course-btn"
                onClick={handleModalOpen}
                style={{ 
                  fontWeight: "600",
                  padding: "12px 30px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  background: "var(--primary-color)",
                  border: "none",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease"
                }}
              >
                <i className="fas fa-plus me-2"></i>Create New Course
              </Button>
            </div>

            <div className="row g-3 justify-content-center" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="col-md-8">
                <div className="search-box">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="select-container">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="default">Sort By</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {filteredCourses.map((course) => {
              const discountedPrice = course.course_price - course.course_discount;
              const discountPercentage = ((course.course_discount / course.course_price) * 100).toFixed(0);

              return (
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6" key={course._id}>
                  <Link to={`/course/${course._id}`} className="text-decoration-none">
                    <div className="course-card">
                      <div className="course-card-image">
                        <img
                          src={course.course_img !== "Please enter a course image" ? course.course_img : "https://via.placeholder.com/300"}
                          alt={course.course_name}
                        />
                        {parseInt(discountPercentage) > 0 && (
                          <div className="discount-badge">
                            <i className="fas fa-tags me-1"></i>
                            SAVE {discountPercentage}%
                          </div>
                        )}
                      </div>
                      <div className="course-card-content">
                        <h5 className="course-title">{course.course_name}</h5>
                        <p className="course-desc">{course.course_desc}</p>
                        <div className="course-meta">
                          <span className="duration">
                            <i className="far fa-clock me-1"></i>
                            {course.course_duration}
                          </span>
                          <div className="rating">
                            {renderStars(course.averageRating)}
                            <span className="rating-count">({course.totalReviews})</span>
                          </div>
                        </div>
                        <div className="course-price">
                          <div className="d-flex align-items-center">
                            <span className="original-price">₹{course.course_price}</span>
                            <span className="discounted-price">₹{discountedPrice}</span>
                            {parseInt(discountPercentage) > 0 && (
                              <span className="discount-pill ms-2">-{discountPercentage}%</span>
                            )}
                          </div>
                          {course.course_label && (
                            <span className="badge bg-primary">{course.course_label}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center mt-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h3>No courses found</h3>
              <p className="text-muted">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create Course */}
      <Modal show={showModal} onHide={handleModalClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Create a New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateCourse onSuccess={handleModalClose} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Courses;
