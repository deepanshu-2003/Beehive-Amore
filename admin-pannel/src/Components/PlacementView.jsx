import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import './Placements.css';

const PlacementView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [placement, setPlacement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdminView, setIsAdminView] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editedPlacement, setEditedPlacement] = useState({});
    const [submitting, setSubmitting] = useState(false);

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

    useEffect(() => {
        const fetchPlacementDetails = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                setLoading(true);
                const response = await axios.get(`http://localhost:5000/placement/get-placement/${id}`, {
                    headers: {
                        'auth_token': token
                    }
                });
                setPlacement(response.data);
                setIsAdminView(response.data.isAdminView === true);
                setError(null);
            } catch (error) {
                console.error('Error:', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    toast.error('Please login as admin to view this page');
                    navigate('/login');
                } else {
                    setError('Failed to fetch placement details');
                    toast.error('Error loading placement details');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPlacementDetails();
        }
    }, [id, navigate]);

    const handleEditClick = () => {
        if (!isAdminView) {
            showErrorToast('Please login as admin to edit placement details');
            return;
        }
        setEditedPlacement({...placement});
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this placement?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://localhost:5000/placement/delete-placement/${id}`, {
                headers: { 'auth_token': token }
            });
            toast.success('Placement deleted successfully');
            navigate('/placements');
        } catch (error) {
            console.error('Error deleting placement:', error);
            toast.error('Failed to delete placement');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedPlacement({ ...editedPlacement, [name]: value });
    };

    const validateForm = () => {
        const requiredFields = ['company_name', 'job_title', 'job_description', 'job_location', 'job_type'];
        for (const field of requiredFields) {
            if (!editedPlacement[field] || !editedPlacement[field].trim()) {
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
            const token = localStorage.getItem('auth_token');
            if (!token) {
                showErrorToast('Please login as admin to update placement details');
                setSubmitting(false);
                return;
            }

            // Prepare job skills (ensure it's an array for the API)
            let processedSkills;
            if (typeof editedPlacement.job_skills === 'string') {
                processedSkills = editedPlacement.job_skills.split(',').map(skill => skill.trim()).filter(skill => skill);
            } else if (Array.isArray(editedPlacement.job_skills)) {
                processedSkills = editedPlacement.job_skills;
            } else {
                processedSkills = [];
            }

            const formData = {
                ...editedPlacement,
                job_skills: processedSkills
            };

            const response = await axios.put(`http://localhost:5000/placement/update-placement/${id}`, formData, {
                headers: {
                    'auth_token': token
                }
            });
            
            if (response.data && response.data.placement) {
                const updatedData = response.data.placement;
                updatedData.isAdminView = true;
                setPlacement(updatedData);
            }
            setShowEditModal(false);
            showSuccessToast('Placement updated successfully!');
        } catch (error) {
            if (error.response?.status === 401) {
                showErrorToast('Unauthorized. Please login as admin.');
            } else {
                showErrorToast(error.response?.data?.error || 'Failed to update placement. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <Container className="placement-container">
                    <div className="loading">
                        <Spinner animation="border" role="status" />
                        <p>Loading placement details...</p>
                    </div>
                </Container>
            </>
        );
    }

    if (error || !placement) {
        return (
            <>
                <Header />
                <Container className="placement-container">
                    <Alert variant="danger">
                        {error || "Placement not found"}
                    </Alert>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/placements')}
                        className="mt-3"
                    >
                        Back to Placements
                    </Button>
                </Container>
            </>
        );
    }

    return (
        <>
            <Header />
            <Container className="placement-view-container">
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
                
                <div className="back-button mb-4 d-flex justify-content-between align-items-center">
                    <Button 
                        variant="outline-primary" 
                        onClick={() => navigate('/placements')}
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Placements
                    </Button>
                    
                    {isAdminView && (
                        <div className="admin-actions">
                            <Button 
                                variant="outline-success" 
                                onClick={handleEditClick}
                            >
                                <i className="fas fa-edit me-2"></i>
                                Edit Placement
                            </Button>
                            <Button 
                                variant="outline-danger" 
                                onClick={handleDelete}
                            >
                                <i className="fas fa-trash me-2"></i>
                                Delete Placement
                            </Button>
                        </div>
                    )}
                </div>

                {!isAdminView && (
                    <Alert variant="info" className="mb-4">
                        <i className="fas fa-info-circle me-2"></i>
                        Some information is hidden. Please login as admin to view contact details.
                    </Alert>
                )}

                <Card className="placement-detail-card">
                    <Card.Body>
                        <div className="placement-header-section">
                            <h1 className="job-title">{placement?.job_title || 'Job Title'}</h1>
                            <div className="company-section">
                                <h3 className="company-name">{placement?.company_name || 'Company Name'}</h3>
                                <div className="location-type">
                                    <span className="location-item"><i className="fas fa-map-marker-alt"></i> {placement?.job_location || 'Location'}</span>
                                    <span className="mx-2">•</span>
                                    <span className="type-item"><i className="fas fa-briefcase"></i> {placement?.job_type || 'Job Type'}</span>
                                    
                                    {placement?.job_salary && (
                                        <>
                                            <span className="mx-2">•</span>
                                            <span className="salary-item">
                                                <i className="fas fa-money-bill-wave"></i> {placement.job_salary}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {placement?.job_status && (
                                <Badge 
                                    bg={
                                        placement.job_status === 'Active' ? 'success' : 
                                        placement.job_status === 'Filled' ? 'primary' : 
                                        'secondary'
                                    }
                                    className="status-badge"
                                >
                                    <i className={`fas ${
                                        placement.job_status === 'Active' ? 'fa-check-circle' : 
                                        placement.job_status === 'Filled' ? 'fa-check-double' :
                                        'fa-pause-circle'
                                    } me-2`}></i>
                                    {placement.job_status}
                                </Badge>
                            )}
                        </div>

                        <Row className="mt-4">
                            <Col md={8}>
                                <div className="job-details-section">
                                    <h4 className="section-title">Job Description</h4>
                                    <div className="job-description">
                                        {placement?.job_description && placement.job_description.split('\n').map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))}
                                    </div>

                                    {placement?.job_qualification && (
                                        <div className="qualification-section mt-4">
                                            <h4 className="section-title">Qualifications</h4>
                                            <p>{placement.job_qualification}</p>
                                        </div>
                                    )}

                                    {placement?.job_skills && Array.isArray(placement.job_skills) && placement.job_skills.length > 0 && (
                                        <div className="skills-section mt-4">
                                            <h4 className="section-title">Required Skills</h4>
                                            <div className="skills-list">
                                                {Array.isArray(placement.job_skills) 
                                                    ? placement.job_skills.map((skill, index) => (
                                                        <Badge key={index} bg="info" className="skill-badge">
                                                            {skill}
                                                        </Badge>
                                                    ))
                                                    : typeof placement.job_skills === 'string' ? placement.job_skills.split(',').map((skill, index) => (
                                                        <Badge key={index} bg="info" className="skill-badge">
                                                            {skill.trim()}
                                                        </Badge>
                                                    )) : null
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="company-info-card">
                                    <h4 className="section-title">Job Details</h4>
                                    
                                    {placement?.job_created_at && (
                                        <div className="detail-item">
                                            <div className="detail-label">
                                                <i className="fas fa-calendar-alt"></i>
                                                Posted On
                                            </div>
                                            <div className="detail-value">
                                                {new Date(placement.job_created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {placement?.job_experience && (
                                        <div className="detail-item">
                                            <div className="detail-label">
                                                <i className="fas fa-user-clock"></i>
                                                Experience
                                            </div>
                                            <div className="detail-value">{placement.job_experience}</div>
                                        </div>
                                    )}
                                    
                                    {placement?.job_category && (
                                        <div className="detail-item">
                                            <div className="detail-label">
                                                <i className="fas fa-tag"></i>
                                                Category
                                            </div>
                                            <div className="detail-value">{placement.job_category}</div>
                                        </div>
                                    )}

                                    <h4 className="section-title mt-4">Company Information</h4>
                                    
                                    {placement?.company_email && (
                                        <div className="detail-item">
                                            <div className="detail-label">
                                                <i className="fas fa-envelope"></i>
                                                Email
                                            </div>
                                            <div className="detail-value">
                                                {placement.company_email.includes("Login as admin") ? (
                                                    <span className="text-muted">{placement.company_email}</span>
                                                ) : (
                                                    <a href={`mailto:${placement.company_email}`}>
                                                        {placement.company_email}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {placement?.company_phone && (
                                        <div className="detail-item">
                                            <div className="detail-label">
                                                <i className="fas fa-phone"></i>
                                                Phone
                                            </div>
                                            <div className="detail-value">
                                                {placement.company_phone.includes("Login as admin") ? (
                                                    <span className="text-muted">{placement.company_phone}</span>
                                                ) : (
                                                    <a href={`tel:${placement.company_phone}`}>
                                                        {placement.company_phone}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {placement?.company_address && (
                                        <div className="detail-item">
                                            <div className="detail-label">
                                                <i className="fas fa-map-marker-alt"></i>
                                                Address
                                            </div>
                                            <div className="detail-value">
                                                {placement.company_address.includes("Login as admin") ? (
                                                    <span className="text-muted">{placement.company_address}</span>
                                                ) : (
                                                    placement.company_address
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <Button className="apply-btn w-100 mt-4">
                                    <i className="fas fa-paper-plane me-2"></i>
                                    Apply Now
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>

            {/* Edit Placement Modal */}
            <Modal 
                show={showEditModal} 
                onHide={() => setShowEditModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Placement</Modal.Title>
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
                                        value={editedPlacement.company_name || ''}
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
                                        value={editedPlacement.company_email || ''}
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
                                        value={editedPlacement.company_phone || ''}
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
                                        value={editedPlacement.company_address || ''}
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
                                        value={editedPlacement.job_title || ''}
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
                                        value={editedPlacement.job_category || ''}
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
                                value={editedPlacement.job_description || ''}
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
                                        value={editedPlacement.job_location || ''}
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
                                        value={editedPlacement.job_type || ''}
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
                                        value={editedPlacement.job_salary || ''}
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
                                        value={editedPlacement.job_experience || ''}
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
                                        value={editedPlacement.job_qualification || ''}
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
                                        value={Array.isArray(editedPlacement.job_skills) 
                                            ? editedPlacement.job_skills.join(', ') 
                                            : editedPlacement.job_skills || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g. React, Node.js, MongoDB (comma-separated)"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Job Status</Form.Label>
                                    <Form.Select
                                        name="job_status"
                                        value={editedPlacement.job_status || 'Active'}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Filled">Filled</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2">
                            <Button 
                                variant="secondary" 
                                onClick={() => setShowEditModal(false)}
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
                                        Updating...
                                    </>
                                ) : (
                                    'Update Placement'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default PlacementView;
