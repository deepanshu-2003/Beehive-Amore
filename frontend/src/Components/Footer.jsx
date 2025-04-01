import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-dark text-light py-4">
            <div className="container">
                <div className="row">
                    {/* About Section */}
                    <div className="col-md-4 mb-3">
                        <h5 className="text-uppercase text-primary">About Us</h5>
                        <p className="small">
                            We provide high-quality online or offline courses to help you achieve your career goals. Join us to learn
                            the latest technologies and boost your skills. We also serve Digital Marketing or coding Services. 
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-md-4 mb-3">
                        <h5 className="text-uppercase text-primary">Quick Links</h5>
                        <ul className="list-unstyled">
                            <li>
                                <a href="/about" className="text-light text-decoration-none">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="/courses" className="text-light text-decoration-none">
                                    Courses
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="text-light text-decoration-none">
                                    Contact
                                </a>
                            </li>
                            
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="col-md-4 mb-3">
                        <h5 className="text-uppercase text-primary">Contact Us</h5>
                        <p className="small mb-1">
                            <i className="bi bi-geo-alt-fill text-primary"></i> Laxmi Cloth Market, 2nd floor, Near Bus Stand, Sonipat (131001)
                        </p>
                        <p className="small mb-1">
                            <i className="bi bi-envelope-fill text-primary"></i> beehiveamore@gmail.com
                        </p>
                        <p className="small mb-1">
                            <i className="bi bi-telephone-fill text-primary"></i> +91 8571946962 , +91 8571942962
                        </p>
                        
                    </div>
                </div>

                <hr className="bg-secondary" />

                {/* Social Media Links */}
                <div className="text-center">
                    <a href="https://www.facebook.com/share/16Cv7gTnnf/" className="text-light mx-2 text-decoration-none" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-facebook"></i>
                    </a>
                    <a href="https://www.youtube.com/@beehiveamore/" className="text-light mx-2 text-decoration-none" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-youtube"></i>
                    </a>
                    <a href="https://www.twitter.com/BeehiveAmore" className="text-light mx-2 text-decoration-none" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-twitter"></i>
                    </a>
                    <a href="https://www.instagram.com/beehiveamore/" className="text-light mx-2 text-decoration-none" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-instagram"></i>
                    </a>
                    <a href="https://www.linkedin.com/company/BeehiveAmore" className="text-light mx-2 text-decoration-none" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-linkedin"></i>
                    </a>
                </div>

                {/* Copyright */}
                <div className="text-center mt-3">
                    <small>&copy; 2025 Beehive Amore. All Rights Reserved.</small>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
