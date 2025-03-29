import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Nav, Tab, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import './Placement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { showToast, persistentToast } from '../utils/toastUtils';
import { AuthContext } from '../contexts/AuthContext';
import {
    faArrowLeft, faBuilding, faCalendarAlt, faMapMarkerAlt,
    faDollarSign, faClock, faExclamationTriangle, faBriefcase,
    faGraduationCap, faUserClock, faTag, faEnvelope, faPhone, faSuitcase,
    faPaperPlane, faCheckCircle, faTimesCircle, faFileUpload
} from '@fortawesome/free-solid-svg-icons';

const PlacementView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [placement, setPlacement] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');
    const { isLoggedIn } = useContext(AuthContext);

    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyHover, setApplyHover] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        resume: null,
        coverLetter: '',
        portfolio: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, ] = useState(null);

    useEffect(() => {
        fetchPlacementDetails();
    }, [id]);

    const fetchPlacementDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/placement/get-placement-public/${id}`);
            setPlacement(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching placement:', err);
            setError('Failed to load placement details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="placement-view-container">
                <div className="loading-container">
                    <div className="loading-spinner">
                        <Spinner animation="border" role="status" variant="primary" />
                        <p className="loading-text">Loading placement details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !placement) {
        return (
            <div className="placement-view-container">
                <Container>
                    <div className="error-container">
                        <div className="error-content">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
                            <h3>Placement Not Found</h3>
                            <p>{error || "This job placement may have been removed or is no longer available."}</p>
                            <Button
                                variant="outline-primary"
                                className="back-button"
                                onClick={() => navigate('/placements')}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                View All Placements
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    const getStatusClass = () => {
        const status = placement.job_status?.toLowerCase() || 'inactive';
        return status === 'active' ? 'active' :
               status === 'filled' ? 'filled' : 'inactive';
    };

    const getStatusText = () => {
        const status = placement.job_status?.toLowerCase() || 'inactive';
        return status === 'active' ? 'Active' :
               status === 'filled' ? 'Filled' : 'Inactive';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const statusClass = getStatusClass();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                resume: file
            });
            if (formErrors.resume) {
                setFormErrors({
                    ...formErrors,
                    resume: null
                });
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) errors.phone = 'Phone number is required';
        if (!formData.resume) errors.resume = 'Resume is required';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setSubmitting(true);
        // setSubmitError(null);

        try {
            // Create form data for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('resume', formData.resume);
            formDataToSend.append('coverLetter', formData.coverLetter);
            formDataToSend.append('portfolio', formData.portfolio);
            formDataToSend.append('placementId', id);

            const response = await axios.post(`http://localhost:5000/placement/apply/${id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            persistentToast.show(
                'application-submitted',
                'Application submitted successfully! We will review your details and contact you soon.',
                'success',
                { autoClose: 6000 }
            );

            setTimeout(() => {
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    resume: null,
                    coverLetter: '',
                    portfolio: ''
                });
                setSubmitSuccess(true);
                setTimeout(() => setShowApplyModal(false), 1500);
            }, 1000);

        } catch (error) {
            console.error('Error submitting application:', error);
            let errorMessage = 'Failed to submit your application. Please try again later.';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }
            showToast('application-error', errorMessage, 'error');
        } finally {
            setSubmitting(false);
            setShowApplyModal(false);
        }
    };

    return (
        <div className="placement-view-container">

            <div className={`job-header ${statusClass}-header`}>
                <Container>
                    <Button
                        className="back-button header-back-btn"
                        onClick={() => navigate('/placements')}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Back
                    </Button>
                    <div className="status-indicator">
                        <div className="pulse" style={{
                            background: statusClass === 'active' ? '#10b981' :
                                        statusClass === 'inactive' ? '#64748b' : '#8b5cf6'
                        }}></div>
                        <span>{getStatusText()}</span>
                    </div>
                    <h1 className="job-title">
                        <FontAwesomeIcon icon={faSuitcase} className="title-icon" />
                        {placement.job_title}
                    </h1>
                    <h2 className="company-name">
                        <FontAwesomeIcon icon={faBuilding} className="title-icon" />
                        {placement.company_name}
                    </h2>
                    <div className="job-meta">
                        {placement.job_location && (
                            <div className="meta-item">
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                <span>{placement.job_location}</span>
                            </div>
                        )}
                        {placement.job_type && (
                            <div className="meta-item">
                                <FontAwesomeIcon icon={faBriefcase} />
                                <span>{placement.job_type}</span>
                            </div>
                        )}
                        {placement.job_salary && (
                            <div className="meta-item">
                                <FontAwesomeIcon icon={faDollarSign} />
                                <span>{placement.job_salary}</span>
                            </div>
                        )}
                        {placement.application_deadline && (
                            <div className="meta-item">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span>Deadline: {formatDate(placement.application_deadline)}</span>
                            </div>
                        )}
                    </div>
                </Container>
            </div>

            <div className="placement-content">
                <Container>
                    <Row>
                        <Col lg={8}>
                            <Card className="job-content-card mb-4">
                                <Card.Body>
                                    <Tab.Container id="job-tabs" defaultActiveKey="description" onSelect={(k) => setActiveTab(k)}>
                                        <Nav variant="tabs" className="job-tabs">
                                            <Nav.Item>
                                                <Nav.Link eventKey="description">Description</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="requirements">Requirements</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="company">Company</Nav.Link>
                                            </Nav.Item>
                                            {placement.application_process && (
                                                <Nav.Item>
                                                    <Nav.Link eventKey="application">How to Apply</Nav.Link>
                                                </Nav.Item>
                                            )}
                                        </Nav>

                                        <Tab.Content>
                                            <Tab.Pane eventKey="description">
                                                <div className="job-description" dangerouslySetInnerHTML={{ __html: placement.job_description }} />
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="requirements">
                                                <div className="job-description">
                                                    <h3>Required Skills</h3>
                                                    <div className="skills-container">
                                                        {Array.isArray(placement.job_skills) ?
                                                            placement.job_skills.map((skill, index) => (
                                                                <div key={index} className="skill-badge">
                                                                    {skill}
                                                                </div>
                                                            )) :
                                                            typeof placement.job_skills === 'string' ?
                                                                placement.job_skills.split(',').map((skill, index) => {
                                                                    return (
                                                                        <div key={index} className="skill-badge">
                                                                            {skill.trim()}
                                                                        </div>
                                                                    )
                                                                }) :
                                                                <p>No specific skills listed</p>
                                                        }
                                                    </div>

                                                    {placement.qualifications && (
                                                        <>
                                                            <h3>Qualifications</h3>
                                                            <div dangerouslySetInnerHTML={{ __html: placement.qualifications }} />
                                                        </>
                                                    )}

                                                    {placement.job_experience && (
                                                        <>
                                                            <h3>Experience</h3>
                                                            <p>{placement.job_experience}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </Tab.Pane>

                                            <Tab.Pane eventKey="company">
                                                <div className="job-description">
                                                    <h3>About {placement.company_name}</h3>
                                                    <div dangerouslySetInnerHTML={{ __html: placement.company_description }} />
                                                </div>
                                            </Tab.Pane>

                                            {placement.application_process && (
                                                <Tab.Pane eventKey="application">
                                                    <div className="job-description" dangerouslySetInnerHTML={{ __html: placement.application_process }} />
                                                </Tab.Pane>
                                            )}
                                        </Tab.Content>
                                    </Tab.Container>
                                </Card.Body>
                            </Card>

                            <div className="application-section">
                                <h3 className="apply-title">Ready to Apply?</h3>
                                <p>Submit your application for this position through our online portal.</p>
                                <div className="application-actions">
                                    <Button
                                        className={`apply-button ${statusClass} ${applyHover ? 'apply-hover' : ''}`}
                                        disabled={statusClass !== 'active'}
                                         onClick={() => {
                                             if (!isLoggedIn) {
                                                 showToast.warning('Please login to apply for this placement.', 'Login Required');
                                                 navigate('/login');
                                             } else {
                                                 setShowApplyModal(true);
                                             }
                                         }}
                                         onMouseEnter={() => setApplyHover(true)}
                                         onMouseLeave={() => setApplyHover(false)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faPaperPlane}
                                            className={`apply-icon ${applyHover ? 'apply-icon-animate' : ''}`}
                                         />
                                         <span className="apply-text">
                                             {statusClass === 'active' ? 'Apply Now' :
                                                 statusClass === 'inactive' ? 'Currently Unavailable' :
                                                     'Position Filled'}
                                         </span>
                                    </Button>
                                    <Button
                                        className="back-button"
                                        onClick={() => navigate('/placements')}
                                    >
                                        View Other Opportunities
                                    </Button>
                                </div>
                            </div>
                        </Col>

                        <Col lg={4}>
                            <Card className="job-content-card">
                                <Card.Body>
                                    <h3>Job Overview</h3>
                                    <div className="mt-3">
                                        {placement.application_deadline && (
                                            <div className="d-flex align-items-center mb-3">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="me-3 text-muted" />
                                                <div>
                                                    <div className="text-muted small">Application Deadline</div>
                                                    <div>{formatDate(placement.application_deadline)}</div>
                                                </div>
                                            </div>
                                        )}

                                        {placement.job_experience && (
                                            <div className="d-flex align-items-center mb-3">
                                                 <FontAwesomeIcon icon={faUserClock} className="me-3 text-muted" />
                                                 <div>
                                                     <div className="text-muted small">Experience Required</div>
                                                     <div>{placement.job_experience || 'Not specified'}</div>
                                                 </div>
                                             </div>
                                         )}

                                        {placement.job_qualification && (
                                            <div className="d-flex align-items-center mb-3">
                                                <FontAwesomeIcon icon={faGraduationCap} className="me-3 text-muted" />
                                                <div>
                                                    <div className="text-muted small">Qualification</div>
                                                    <div>{placement.job_qualification || 'Not specified'}</div>
                                                 </div>
                                             </div>
                                        )}

                                        {placement.job_category && (
                                            <div className="d-flex align-items-center mb-3">
                                                <FontAwesomeIcon icon={faTag} className="me-3 text-muted" />
                                                <div>
                                                    <div className="text-muted small">Category</div>
                                                    <div>{placement.job_category}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>

                            {(placement.contact_email || placement.contact_phone) && (
                                <Card className="job-content-card mt-4">
                                    <Card.Body>
                                        <h3>Contact Information</h3>
                                        <p className="mt-3 text-muted">
                                            For any queries regarding this position, please reach out to the HR department.
                                        </p>
                                        {placement.contact_email && (
                                            <div className="d-flex align-items-center mb-3">
                                                <FontAwesomeIcon icon={faEnvelope} className="me-3 text-muted" />
                                                <span>{placement.contact_email}</span>
                                            </div>
                                        )}
                                        {placement.contact_phone && (
                                            <div className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faPhone} className="me-3 text-muted" />
                                                <span>{placement.contact_phone}</span>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Application Modal */}
            <Modal
                show={showApplyModal}
                onHide={() => !submitting && setShowApplyModal(false)}
                centered
                size="lg"
                className="apply-modal"
            >
                <Modal.Header closeButton={!submitting}>
                    <Modal.Title className="apply-modal-title">
                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                        Apply for {placement?.job_title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {submitSuccess ? (
                        <div className="success-message">
                            <div className="success-icon-container">
                                <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
                            </div>
                            <h4>Application Submitted Successfully!</h4>
                            <p>Thank you for applying to {placement?.job_title} at {placement?.company_name}. We'll review your application and get back to you soon.</p>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            isInvalid={!!formErrors.name}
                                            disabled={submitting}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.name}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            isInvalid={!!formErrors.email}
                                            disabled={submitting}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            isInvalid={!!formErrors.phone}
                                            disabled={submitting}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.phone}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Portfolio URL</Form.Label>
                                        <Form.Control
                                            type="url"
                                            name="portfolio"
                                            value={formData.portfolio}
                                            onChange={handleInputChange}
                                            disabled={submitting}
                                            placeholder="https://yourportfolio.com"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Resume/CV <span className="text-danger">*</span></Form.Label>
                                <div className={`resume-upload ${formErrors.resume ? 'is-invalid' : ''}`}>
                                    <FontAwesomeIcon icon={faFileUpload} className="upload-icon" />
                                    <span>{formData.resume ? formData.resume.name : 'Upload your resume (PDF, DOC, DOCX)'}</span>
                                    <Form.Control
                                        type="file"
                                        name="resume"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx"
                                        disabled={submitting}
                                        className="file-input"
                                    />
                                </div>
                                {formErrors.resume && (
                                    <div className="invalid-feedback d-block">
                                        {formErrors.resume}
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Cover Letter</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="coverLetter"
                                    value={formData.coverLetter}
                                    onChange={handleInputChange}
                                    rows={4}
                                    disabled={submitting}
                                    placeholder="Tell us why you're interested in this position and what makes you a great fit."
                                />
                            </Form.Group>

                            <div className="form-actions">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowApplyModal(false)}
                                    disabled={submitting}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className={`submit-btn ${statusClass}`}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                            Submit Application
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default PlacementView;
