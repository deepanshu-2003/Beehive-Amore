import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './Footer';
import './Home.css';
import { Link } from 'react-router-dom';
import { showToast } from '../utils/toastUtils'; // Import the centralized toast utility
import Services from './Services'; // Import the new Services component

const Home = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (message) {
            showToast.info(message); // Use the centralized toast utility with correct method
            setMessage('');
        }
    }, [message]);

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section text-white text-center d-flex align-items-center position-relative" style={heroStyle}>
                <div className="container position-relative z-index-1">
                    <h1 className="display-4 mt-5 fw-bold">Empowering Your Digital Presence</h1>
                    <p className="lead mt-3">
                        Transform your business with cutting-edge digital marketing strategies. Let us help you grow.
                    </p>
                    <a href="#services" className="btn btn-primary btn-lg mt-4">Get Started</a>
                </div>
            </section>

            {/* Services Section */}
            <Services />

            {/* Why Choose Us Section */}
            <section className="why-us py-5">
                <div className="container">
                    <h2 className="text-center mb-5">Why Choose Us</h2>
                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="text-center">
                                <i className="fas fa-award fa-3x mb-3 text-primary"></i>
                                <h4>Expert Team</h4>
                                <p>Our professionals bring years of industry experience.</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="text-center">
                                <i className="fas fa-rocket fa-3x mb-3 text-primary"></i>
                                <h4>Fast Results</h4>
                                <p>See measurable improvements in your digital presence.</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="text-center">
                                <i className="fas fa-headset fa-3x mb-3 text-primary"></i>
                                <h4>24/7 Support</h4>
                                <p>We're always here to help you succeed.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Call to Action Section */}
            <section className="cta-section text-white text-center py-5" style={ctaStyle}>
                <div className="container">
                    <h2 className="mb-3">Ready to Grow Your Business?</h2>
                    <Link to="/contact" className="btn btn-light btn-lg">Contact Us Today</Link>
                </div>
            </section>
            <Footer />
        </>
    );
};

// Inline Styles
const heroStyle = {
    background: 'url(/anvi_digital_hub.png) no-repeat center center/cover',
    minHeight: '60vh',
    position: 'relative',
};

const ctaStyle = {
    background: '#343a40',
};

export default Home;
