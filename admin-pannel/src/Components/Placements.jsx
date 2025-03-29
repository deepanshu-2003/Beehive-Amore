import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import './Placements.css';

const Placements = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [newPlacement, setNewPlacement] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    job_title: '',
    job_description: '',
    job_location: '',
    job_type: '',
    job_category: '',
    job_salary: '',
    job_experience: '',
    job_qualification: '',
    job_skills: '',
    job_status: 'Active'
  });

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  };

  const showSuccessToast = (message) => {
    toast.success(message, {
      ...toastConfig,
      icon: '🎉',
      style: {
        background: '#10B981',
        color: '#ffffff',
        borderRadius: '10px',
        fontWeight: '500',
        padding: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      ...toastConfig,
      icon: '⚠️',
      style: {
        background: '#EF4444',
        color: '#ffffff',
        borderRadius: '10px',
        fontWeight: '500',
        padding: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }
    });
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get("http://localhost:5000/placement/get-placements", {
          headers: {
            "auth_token": token
          }
        });

        if (!response.data.isAdmin) {
          toast.error('Access denied. Admin only.');
          navigate('/login');
          return;
        }

        setPlacements(response.data.placements);
        setIsAdminView(true);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching placements:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("Please login as admin to view this page");
          navigate('/login');
        } else {
          toast.error("Failed to fetch placements");
        }
        setLoading(false);
      }
    };
    fetchPlacements();
  }, []);

  const filteredPlacements = placements.filter(placement => 
    placement.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    placement.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    placement.job_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlacement({ ...newPlacement, [name]: value });
  };

  const validateForm = () => {
    const requiredFields = ['company_name', 'job_title', 'job_description', 'job_location', 'job_type'];
    for (const field of requiredFields) {
      if (!newPlacement[field].trim()) {
        const fieldName = field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        showErrorToast(`${fieldName} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const formData = {
        ...newPlacement,
        job_skills: newPlacement.job_skills.split(',').map(skill => skill.trim())
      };

      const token = localStorage.getItem("auth_token");
      if (!token) {
        showErrorToast('Please login as admin to create placements');
        setSubmitting(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/placement/create-placement', formData, {
        headers: {
          'auth_token': token
        }
      });
      
      setPlacements([response.data.placement, ...placements]);
      setShowModal(false);
      setNewPlacement({
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        job_title: '',
        job_description: '',
        job_location: '',
        job_type: '',
        job_category: '',
        job_salary: '',
        job_experience: '',
        job_qualification: '',
        job_skills: '',
        job_status: 'Active'
      });
      showSuccessToast('🎉 Placement created successfully!');
    } catch (error) {
      if (error.response?.status === 401) {
        showErrorToast('Unauthorized. Please login as admin.');
      } else {
        showErrorToast(error.response?.data?.error || 'Failed to create placement. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error('Please login to perform this action');
        navigate('/login');
        return;
      }

      await axios.put(
        `http://localhost:5000/placement/update-placement/${id}`,
        { job_status: newStatus },
        {
          headers: { 'auth_token': token }
        }
      );
      toast.success("Status updated successfully");
      const updatedPlacements = placements.map(placement => placement._id === id ? { ...placement, job_status: newStatus } : placement);
      setPlacements(updatedPlacements);
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Please login as admin to perform this action');
        navigate('/login');
      } else {
        toast.error('Failed to update status');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this placement?")) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error('Please login to perform this action');
        navigate('/login');
        return;
      }

      await axios.delete(`http://localhost:5000/placement/delete-placement/${id}`, {
        headers: { 'auth_token': token }
      });
      toast.success("Placement deleted successfully");
      const updatedPlacements = placements.filter(placement => placement._id !== id);
      setPlacements(updatedPlacements);
    } catch (error) {
      console.error("Error deleting placement:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Please login as admin to perform this action');
        navigate('/login');
      } else {
        toast.error('Failed to delete placement');
      }
    }
  };

  const renderPlacementCards = () => {
    if (filteredPlacements.length === 0) {
      return (
        <div className="no-placements">
          <h3>No Placements Found</h3>
          <p>Try adjusting your search criteria or create a new placement</p>
        </div>
      );
    }

    return filteredPlacements.map((placement) => (
      <Col key={placement._id} lg={4} md={6} sm={12} className="mb-4">
        <Card className="placement-card">
          <Card.Body>
            <Card.Title>{placement.job_title}</Card.Title>
            <div className="company-name">{placement.company_name}</div>
            <div className="location-type">
              <span className="location-item"><i className="fas fa-map-marker-alt"></i> {placement.job_location}</span>
              <span className="mx-2">•</span>
              <span className="type-item"><i className="fas fa-briefcase"></i> {placement.job_type}</span>
              {placement.job_status && (
                <>
                  <span className="mx-2">•</span>
                  <span className={`status-badge status-${placement.job_status.toLowerCase()}`}>
                    <i className={`fas ${placement.job_status === 'Active' ? 'fa-check-circle' : 
                                    placement.job_status === 'Inactive' ? 'fa-pause-circle' : 
                                    'fa-check-double'}`}></i>
                    {placement.job_status}
                  </span>
                </>
              )}
            </div>
            <Card.Text>
              {placement.job_description.length > 150 
                ? `${placement.job_description.substring(0, 150)}...` 
                : placement.job_description}
            </Card.Text>
            {placement.job_salary && (
              <div className="salary-info">
                <i className="fas fa-money-bill-wave"></i>
                {placement.job_salary}
              </div>
            )}
            
            <div className="card-actions">
              <Link to={`/placement/${placement._id}`}>
                <Button className="view-btn">
                  <i className="fas fa-eye me-1"></i> View Details
                </Button>
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Col>
    ));
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="placement-container">
          <div className="loading">
            <Spinner animation="border" role="status" />
            <p>Loading placements...</p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="placement-container">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        
        <div className="placement-header">
          <h1>Placement Opportunities</h1>
          <p>Find and manage exciting career opportunities for students</p>
          <Form className="search-form">
            <Form.Control
              type="text"
              placeholder="Search by job title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form>
          {isAdminView ? (
            <Button 
              className="create-btn"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-plus-circle me-2"></i>
              Create New Placement
            </Button>
          ) : (
            <Alert variant="info" className="mt-3 mb-3">
              <i className="fas fa-info-circle me-2"></i>
              Please login as admin to add new placements and view contact details.
            </Alert>
          )}
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        <Row>{renderPlacementCards()}</Row>

        <Modal 
          show={showModal} 
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Create New Placement</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name*</Form.Label>
                    <Form.Control
                      type="text"
                      name="company_name"
                      value={newPlacement.company_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Tech Corp"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="company_email"
                      value={newPlacement.company_email}
                      onChange={handleInputChange}
                      placeholder="e.g. hr@techcorp.com"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="company_phone"
                      value={newPlacement.company_phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +919876543210"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="company_address"
                      value={newPlacement.company_address}
                      onChange={handleInputChange}
                      placeholder="Enter company address"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Title*</Form.Label>
                    <Form.Control
                      type="text"
                      name="job_title"
                      value={newPlacement.job_title}
                      onChange={handleInputChange}
                      placeholder="e.g. Software Engineer"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Category</Form.Label>
                    <Form.Control
                      type="text"
                      name="job_category"
                      value={newPlacement.job_category}
                      onChange={handleInputChange}
                      placeholder="e.g. Information Technology"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Job Description*</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="job_description"
                  value={newPlacement.job_description}
                  onChange={handleInputChange}
                  placeholder="Enter job description..."
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location*</Form.Label>
                    <Form.Control
                      type="text"
                      name="job_location"
                      value={newPlacement.job_location}
                      onChange={handleInputChange}
                      placeholder="e.g. New York, NY"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Type*</Form.Label>
                    <Form.Select
                      name="job_type"
                      value={newPlacement.job_type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Job Type</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Salary Range</Form.Label>
                    <Form.Control
                      type="text"
                      name="job_salary"
                      value={newPlacement.job_salary}
                      onChange={handleInputChange}
                      placeholder="e.g. $80,000 - $100,000"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Experience Required</Form.Label>
                    <Form.Control
                      type="text"
                      name="job_experience"
                      value={newPlacement.job_experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 2-3 years"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Qualification</Form.Label>
                    <Form.Control
                      type="text"
                      name="job_qualification"
                      value={newPlacement.job_qualification}
                      onChange={handleInputChange}
                      placeholder="e.g. Bachelor's Degree"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Required Skills</Form.Label>
                    <Form.Control
                      type="text"
                      name="job_skills"
                      value={newPlacement.job_skills}
                      onChange={handleInputChange}
                      placeholder="e.g. React, Node.js, MongoDB (comma-separated)"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Creating...
                    </>
                  ) : (
                    'Create Placement'
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default Placements;
