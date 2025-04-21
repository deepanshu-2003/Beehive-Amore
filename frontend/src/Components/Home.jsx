import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { Link } from 'react-router-dom';
import hero from "/hero-illustration.png"
import { showToast } from '../utils/toastUtils'; // Import the centralized toast utility
import Footer from "./Footer";


const Home = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Animate counters - scoped to home section
        const counters = document.querySelectorAll('.home-section .counter');
        const animationDuration = 2000; // 2 seconds
        
        counters.forEach(counter => {
            const suffix = counter.textContent.replace(/[0-9]/g, '');
            const target = +counter.getAttribute('data-target');
            const start = 0;
            const increment = target / animationDuration * 10;

            const updateCount = () => {
                const current = +counter.innerText.replace(/\D/g, '');
                if (current < target) {
                    counter.innerText = Math.ceil(current + increment) + suffix;
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target + suffix;
                }
            };

            updateCount();
        });
    }, []);

    useEffect(() => {
        if (message) {
            showToast.info(message);
            setMessage('');
        }
    }, [message]);

    return (
        <div className="home-section">
            {/* Glossy Hero Section */}
            <section className="hero-section text-white text-center position-relative overflow-hidden" style={heroStyle}>
                <div className="container py-8 position-relative z-index-2">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="glass-card p-5 rounded-4 animate__animated animate__fadeInUp">
                                <h1 className="display-3 fw-bold mb-4 text-golden"> {/* Added text-golden class */}
                                    Transform Your Digital Presence
                                </h1>
                                <p className="text-white mb-5 opacity-90">
                                    Data-driven strategies for measurable growth in the digital landscape
                                </p>
                                <div className="d-flex gap-3 justify-content-center">
                                    {/* Applied btn-golden class and adjusted size/padding */}
                                    <Link to="/services" className="btn btn-golden btn-lg px-5"> 
                                        Explore Solutions <i className="ms-2 fas fa-arrow-right"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-gradient-overlay"></div>
            </section>

            {/* What We Offer */}
            <section className="py-6 bg-light">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold mb-3">What We Offer</h2>
                        <p className="text-muted">Comprehensive digital marketing solutions for the modern business</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card card h-100 border-0 shadow-sm-hover">
                                <div className="card-body p-4">
                                    <div className="icon-wrapper bg-gradient-primary rounded-circle mb-4">
                                        <i className="fas fa-rocket fa-2x text-white"></i>
                                    </div>
                                    <h4>Growth Marketing</h4>
                                    <p className="text-muted">Data-driven campaigns focused on customer acquisition and retention</p>
                                    <ul className="list-unstyled text-start">
                                        <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i>Conversion Optimization</li>
                                        <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i>Funnel Management</li>
                                        <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i>ROI Tracking</li>
                                    </ul>
                                </div>
                            </div>  
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card card h-100 border-0 shadow-sm-hover">
                                <div className="card-body p-4">
                                    <div className="icon-wrapper bg-gradient-primary rounded-circle mb-4">
                                        <i className="fas fa-chart-network fa-2x text-white"></i>
                                    </div>
                                    <h4>Omnichannel Strategy</h4>
                                    <p className="text-muted">Seamless integration across all digital touchpoints</p>
                                    <ul className="list-unstyled text-start">
                                        <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i>Social Media Management</li>
                                        <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i>Email Marketing</li>
                                        <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i>Content Syndication</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card card h-100 border-0 shadow-sm-hover">
                                <div className="card-body p-4">
                                    <div className="icon-wrapper bg-gradient-primary rounded-circle mb-4">
                                        <i className="fas fa-brain fa-2x text-white"></i>
                                    </div>
                                    <h4>AI-Powered Analytics</h4>
                                    <p className="text-muted">Smart insights for smarter marketing decisions</p>
                                    <ul className="list-unstyled text-start">
                                        <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i>Predictive Analytics</li>
                                        <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i>Competitor Benchmarking</li>
                                        <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i>Real-time Reporting</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            

            {/* Learning Methodology Section */}
            <section className="learning-section py-6">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold mb-3">Our Learning Methodology</h2>
                        <p className="text-muted">Interactive, practical training for digital mastery</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-4">
                            <div className="learning-card card h-100 border-0 shadow-sm">
                                <div className="card-body p-4 text-center">
                                    <div className="icon-circle bg-primary mb-4 mx-auto">
                                        <i className="fas fa-laptop-code fa-2x text-white"></i>
                                    </div>
                                    <h4>Hands-on Workshops</h4>
                                    <p className="text-muted mb-0">Real-time coding sessions with industry experts</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="learning-card card h-100 border-0 shadow-sm">
                                <div className="card-body p-4 text-center">
                                    <div className="icon-circle bg-success mb-4 mx-auto">
                                        <i className="fas fa-chalkboard-teacher fa-2x text-white"></i>
                                    </div>
                                    <h4>Mentorship Program</h4>
                                    <p className="text-muted mb-0">Personalized 1:1 guidance from professionals</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="learning-card card h-100 border-0 shadow-sm">
                                <div className="card-body p-4 text-center">
                                    <div className="icon-circle bg-warning mb-4 mx-auto">
                                        <i className="fas fa-project-diagram fa-2x text-white"></i>
                                    </div>
                                    <h4>Project-Based Curriculum</h4>
                                    <p className="text-muted mb-0">Build real applications during training</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How We Serve */}
            <section className="py-6 bg-white">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold mb-3">How We Serve</h2>
                        <p className="text-muted">Our proven 5-step process for digital success</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-4">
                            <div className="process-step">
                                <div className="step-number">01</div>
                                <h4>Discovery & Analysis</h4>
                                <p>Deep dive into your business objectives and market positioning</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="process-step">
                                <div className="step-number">02</div>
                                <h4>Strategy Development</h4>
                                <p>Customized roadmap for digital growth and engagement</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="process-step">
                                <div className="step-number">03</div>
                                <h4>Implementation</h4>
                                <p>Cross-channel execution with agile methodology</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="process-step">
                                <div className="step-number">04</div>
                                <h4>Optimization</h4>
                                <p>Continuous A/B testing and performance enhancement</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="process-step">
                                <div className="step-number">05</div>
                                <h4>Growth Tracking</h4>
                                <p>Transparent reporting and scalable strategy adjustments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Animated Why Choose Us */}
            <section className="why-choose-us py-6 bg-dark text-white">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-4 fw-bold mb-3">Why We Excel</h2>
                        <p className="lead">Numbers that showcase our digital prowess</p>
                    </div>
                    
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3">
                            <div className="stat-card animate-pop-in">
                                <div className="stat-circle bg-primary">
                                    <span className="counter" data-target="250">0</span>+
                                </div>
                                <h4>Projects Delivered</h4>
                                <p>Successful campaigns completed</p>
                            </div>
                        </div>
                        
                        <div className="col-md-6 col-lg-3">
                            <div className="stat-card animate-pop-in">
                                <div className="stat-circle bg-success">
                                    <span className="counter" data-target="98.7">0</span>%
                                </div>
                                <h4>Client Retention</h4>
                                <p>Long-term partnerships</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="stat-card animate-pop-in">
                                <div className="stat-circle bg-warning">
                                    <span className="counter" data-target="3.8">0</span>x
                                </div>
                                <h4>Average ROI</h4>
                                <p>Return on investment</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="stat-card animate-pop-in">
                                <div className="stat-circle bg-danger">
                                    <span className="counter" data-target="1500">0</span>+
                                </div>
                                <h4>Campaigns</h4>
                                <p>Strategies executed</p>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-5 g-4">
                        <div className="col-lg-6">
                            <div className="feature-card animate-slide-left">
                                <div className="d-flex align-items-center">
                                    <div className="icon-bg bg-primary me-4">
                                        <i className="fas fa-rocket fa-2x"></i>
                                    </div>
                                    <div>
                                        <h3>Lightning-Fast Execution</h3>
                                        <p>Average 48-hour campaign deployment</p>
                                        <div className="progress-bar-animated" style={{width: '100%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="feature-card animate-slide-right">
                                <div className="d-flex align-items-center">
                                    <div className="icon-bg bg-success me-4">
                                        <i className="fas fa-shield-alt fa-2x"></i>
                                    </div>
                                    <div>
                                        <h3>Bank-Grade Security</h3>
                                        <p>100% compliance with data regulations</p>
                                        <div className="progress-bar-animated" style={{width: '100%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-6 bg-primary text-white">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <h2 className="display-5 fw-bold mb-4">Proven Results</h2>
                            <div className="results-list mb-5">
                                <div className="result-item d-flex mb-4">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-chart-line fa-2x me-3"></i>
                                    </div>
                                    <div>
                                        <h4>Average 3.8X ROI</h4>
                                        <p>Across all managed campaigns</p>
                                    </div>
                                </div>
                                <div className="result-item d-flex mb-4">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-users fa-2x me-3"></i>
                                    </div>
                                    <div>
                                        <h4>92% Retention Rate</h4>
                                        <p>Client satisfaction-driven partnerships</p>
                                    </div>
                                </div>
                                <div className="result-item d-flex">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-bolt fa-2x me-3"></i>
                                    </div>
                                    <div>
                                        <h4>48-Hour Setup</h4>
                                        <p>Rapid campaign deployment</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="results-graphic position-relative">
                                <div className="graphic-circle main-circle">
                                    <div className="circle-text">1500+ Successful Campaigns</div>
                                </div>
                                <div className="graphic-circle secondary-circle"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer/>
        </div>
    );
};

// Inline Styles
const heroStyle = {
    background: `url(${hero}) no-repeat center center/cover`,
    minHeight: '60vh',
    position: 'relative',
};

const ctaStyle = {
    background: '#343a40',
};

export default Home;
