import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './Footer';
import './About.css';

const About = () => {
    return (
        <>
            <section className="about-hero">
                <div className="container">
                    <h1>About Us</h1>
                    <p>Feel free to reach out to us with any questions or inquiries.</p>
                </div>
            </section>

            <div className="container mt-5">
                <div className="row">
                    <div className="col-md-12">
                        <h2 className="text-center mb-4">Beehive Amore</h2>
                        <p className="lead text-center">
                            We provide digital marketing services and advanced coding education.
                        </p>
                        <hr/>
                        <h4 className="mt-4">Our Services:</h4>
                        <ul>
                            <li>SEO</li>
                            <li>Social Media Marketing</li>
                            <li>PPC</li>
                            <li>Content Marketing</li>
                            <li>E-commerce Solutions</li>
                        </ul>
                        <hr/>
                        <h4 className="mt-4">Coding Education:</h4>
                        <ul>
                            <li>Web Development</li>
                            <li>AI & Machine Learning</li>
                            <li>Cloud & DevOps</li>
                            <li>Mobile App Development</li>
                            <li>Blockchain</li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default About;
