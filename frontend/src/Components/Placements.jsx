import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { showToast } from '../utils/toastUtils';
import 'react-toastify/dist/ReactToastify.css';
import { Container, Row, Col, Card, Form, Spinner, Badge } from 'react-bootstrap';
import './Placements.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMapMarkerAlt, faBriefcase, faMoneyBillWave, 
    faBuilding, faSuitcase
} from '@fortawesome/free-solid-svg-icons';

const Placements = () => {
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPlacements();
    }, []);

    const fetchPlacements = async () => {
        try {
            // Use only the public endpoint for getting placements
            const response = await axios.get('http://localhost:5000/placement/get-placements-public');
            setPlacements(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching placements:', error);
            showToast.error('Failed to fetch placements');
            setLoading(false);
        }
    };

    const filteredPlacements = placements.filter(placement =>
        placement.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.job_location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <>
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
            <Container className="placement-container">
                
                <div className="placement-header">
                    <h1>Placement Opportunities</h1>
                    <p>Find exciting career opportunities for students</p>
                    
                    <div className="search-container">
                        <div style={{ width: '60%', maxWidth: '500px', margin: '0 auto' }}>
                            <Form.Control
                                type="text"
                                placeholder="Search by job title, company, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                </div>

                <Row>
                    {filteredPlacements.length === 0 ? (
                        <div className="no-placements">
                            <h3>No placements found</h3>
                            <p>Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        filteredPlacements.map((placement) => (
                            <Col key={placement._id} lg={4} md={6} sm={12} className="mb-4">
                                <Card className={`placement-card ${placement.job_status.toLowerCase()}-card`}>
                                    <Card.Body>
                                        <div className="placement-status">
                                            <Badge className={`status-badge ${placement.job_status.toLowerCase()}`}>
                                                {placement.job_status}
                                            </Badge>
                                        </div>
                                        
                                        <h4 className="job-title">
                                            <FontAwesomeIcon icon={faSuitcase} className="me-2" />
                                            {placement.job_title}
                                        </h4>
                                        <div className="company-name">
                                            <FontAwesomeIcon icon={faBuilding} className="me-2" />
                                            {placement.company_name}
                                        </div>
                                        
                                        <div className="meta-info">
                                            <span className="meta-item">
                                                <i className="fas fa-map-marker-alt"></i> {placement.job_location}
                                            </span>
                                            <span className="meta-item">
                                                <i className="fas fa-briefcase"></i> {placement.job_type}
                                            </span>
                                            {placement.job_salary && (
                                                <span className="meta-item">
                                                    <i className="fas fa-money-bill-wave"></i> {placement.job_salary}
                                                </span>
                                            )}
                                        </div>

                                        <Link 
                                            to={`/placement/${placement._id}`} 
                                            className={`btn view-btn mt-3 ${placement.job_status.toLowerCase()}-btn`}
                                        >
                                            View Details
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            </Container>
        </>
    );
};

export default Placements;
