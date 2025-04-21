import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Services.css";
import AOS from "aos";
import "aos/dist/aos.css";
import Footer from "./Footer";

const Services = () => {
  const [activeService, setActiveService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      mirror: false,
      easing: "ease-out-cubic",
    });
  }, []);

  const navigate = useNavigate();

  const services = [
    {
      title: "Web Development",
      description:
        "We build custom websites that are responsive, user-friendly, and optimized for search engines.",
      imgSrc: "/images/services/web-development.jpg",
      alt: "Web Development",
      icon: "fas fa-laptop-code",
      delay: 100,
      features: [
        "Custom UI/UX Design",
        "Responsive Development",
        "SEO Optimization",
      ],
    },
    {
      title: "Search Engine Optimization",
      description:
        "Boost your website's visibility and rank higher on search engines like Google.",
      imgSrc: "/images/services/seo.jpg",
      icon: "fas fa-search",
      delay: 200,
      features: ["Keyword Research", "On-Page SEO", "Link Building"],
    },
    {
      title: "Graphics Designing",
      description:
        "We create stunning graphics for your brand to help you stand out from the competition.",
        imgSrc: "/images/services/graphics-designing.jpg",
        icon: "fas fa-palette",
        delay: 400,
        features: ["Custom Graphics", "Logo Design", "Banner Design"],
      },
    {
      title: "Video Editing",
      description:
      "Professional video editing services to create engaging content for your brand.",
      imgSrc: "/images/services/video-editing.jpg",
      icon: "fas fa-video",
      delay: 300,
      features: ["Motion Graphics", "Color Grading", "Sound Design"],
    },
    {
      title: "Social Media Management",
      description:
      "Strategic social media management to build and engage your online community.",
      imgSrc: "/images/services/social-media.jpg",
      icon: "fas fa-share-alt",
      delay: 400,
      features: [
        "Content Strategy",
        "Community Management",
        "Analytics Reporting",
      ],
    },
    {
      title: "Pay-Per-Click Advertising",
      description:
      "Targeted PPC campaigns that deliver ROI and drive qualified traffic.",
      imgSrc: "/images/services/ppc.jpg",
      icon: "fas fa-ad",
      delay: 500,
      features: ["Campaign Setup", "A/B Testing", "Conversion Tracking"],
    },
    {
      title: "Content Marketing",
      description:
      "Compelling content that tells your story and connects with your audience.",
      imgSrc: "/images/services/content.jpg",
      icon: "fas fa-pen-fancy",
      delay: 600,
      features: ["Blog Writing", "Copywriting", "Content Strategy"],
    },
    {
      title: "Email Marketing",
      description:
      "Strategic email campaigns that nurture leads and drive conversions.",
      imgSrc: "/images/services/email.jpg",
      icon: "fas fa-envelope",
      delay: 700,
      features: ["Campaign Design", "Automation", "List Management"],
    },
    {
      title: "E-commerce Marketing",
      description: "Boost your online store's performance and increase sales.",
      imgSrc: "/images/services/ecommerce.jpg",
      icon: "fas fa-shopping-cart",
      delay: 800,
      features: ["Product Strategy", "Shopping Ads", "Conversion Optimization"],
    },
    {
      title: "Sculpting & 3D Design",
      description:
      "Create stunning 3D models and digital sculptures for various applications.",
      imgSrc: "/images/services/3d-design.jpg",
      icon: "fas fa-cube",
      delay: 900,
      features: ["3D Modeling", "Texturing", "Animation"],
    },
    {
      title: "Placement Services",
      description:
        "We help you to get the best placement opportunties and best guidance for your carreer",
      imgSrc: "/images/services/placement.jpg",
      alt: "Placement Services",
      icon: "fas fa-user-graduate",
      delay: 300,
      features: ["Best Guidance", "Best Placement", "Best Opportunities"],
    },
  ];

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      {/* Header section with gradient background */}
      <section>
        <div className="services-header text-center mb-2">
          <h1 className="display-4 fw-bold mb-2">Our Services</h1>
          <p className="text-white">Explore our wide range of professional services</p>
          
          <div className="search-container">
            <div className="search-box">
              <i className="fas fa-search search-icon"></i>
              <input 
                type="text" 
                placeholder="Search services..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services-section py-5">
        <div className="container">
            <div className="row g-4">
              {filteredServices.length === 0 ? (
                <div className="col-12 text-center">
                  <i className="fas fa-search fa-3x mb-3"></i>
                  <h4>No services found</h4>
                  <p>Try adjusting your search criteria</p>
                </div>
              ) : (
                filteredServices.map((service, index) => (
                  <div className="col-lg-4 col-md-6" key={index}>
                    <div
                      className={`service-card-wrapper ${
                        activeService === index ? "active" : ""
                      }`}
                      onMouseEnter={() => setActiveService(index)}
                      onMouseLeave={() => setActiveService(null)}
                    >
                      <div className="service-card" onClick={() => navigate(`/services/${service.title}`)} style={{cursor: "pointer"}}>
                        <div className="card-img-wrapper">
                          <img
                            src={service.imgSrc}
                            alt={service.title}
                            className="card-img-top"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/services/default.jpg";
                            }}
                          />
                          <div className="card-img-overlay">
                            <i className={`${service.icon} service-icon`}></i>
                          </div>
                        </div>
                        <div className="service-badge">
                          <i className={service.icon}></i>
                        </div>
                        <div className="card-body">
                          <h3 className="card-title h5">{service.title}</h3>
                          <p className="card-text">{service.description}</p>
                          <ul className="feature-list">
                            {service.features.map((feature, idx) => (
                              <li key={idx}>
                                <i className="fas fa-check-circle text-primary me-2"></i>
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <button
                            className="btn btn-primary btn-hover-effect w-100"
                            onClick={() => navigate(`/services/${service.title}`)}
                          >
                            Explore Service
                            <i className="fas fa-arrow-right ms-2"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Services;
