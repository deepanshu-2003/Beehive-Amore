import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ServiceDetail.css';
import Footer from './Footer';
import AOS from 'aos';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { showToast } from '../utils/toastUtils';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Add this services data object above the ServiceDetail component
const servicesData = {
    'Web Development': {
        title: "Web Development",
        hero: "/images/services/web-development-hero.jpg",
        description: "Custom web development solutions tailored to your business needs",
        overview: "We create responsive, user-friendly websites that help businesses establish a strong online presence.",
        features: [
            {
                title: "Custom Development",
                description: "Tailored solutions that match your specific business requirements",
                icon: "fas fa-code"
            },
            {
                title: "Responsive Design",
                description: "Websites that look and work perfectly on all devices",
                icon: "fas fa-mobile-alt"
            },
            {
                title: "Performance Optimization",
                description: "Fast-loading pages optimized for search engines",
                icon: "fas fa-tachometer-alt"
            }
        ],
        process: [
            { step: 1, title: "Discovery", description: "Understanding your requirements" },
            { step: 2, title: "Planning", description: "Creating project roadmap" },
            { step: 3, title: "Design", description: "UI/UX design and prototyping" },
            { step: 4, title: "Development", description: "Building your solution" },
            { step: 5, title: "Testing", description: "Quality assurance" },
            { step: 6, title: "Launch", description: "Deployment and support" }
        ],
        technologies: ["React", "Node.js", "MongoDB", "AWS", "Docker", "Redux"],
        faq: [
            {
                question: "How long does it take to develop a website?",
                answer: "The timeline varies depending on the complexity of your project. A simple website might take 4-6 weeks, while more complex applications can take 3-6 months."
            },
            {
                question: "Do you provide maintenance services?",
                answer: "Yes, we offer ongoing maintenance and support services to ensure your website remains secure and up-to-date."
            }
        ]
    },
    'Search Engine Optimization': {
        title: "Search Engine Optimization",
        hero: "/images/services/seo-hero.jpg",
        description: "Boost your website's visibility and rank higher on search engines",
        overview: "We provide comprehensive SEO solutions to improve your online presence and drive organic traffic.",
        features: [
            {
                title: "Keyword Research",
                description: "In-depth analysis to target the most valuable search terms",
                icon: "fas fa-search"
            },
            {
                title: "On-Page SEO",
                description: "Technical optimization of your website's content and structure",
                icon: "fas fa-file-code"
            },
            {
                title: "Link Building",
                description: "Strategic acquisition of quality backlinks",
                icon: "fas fa-link"
            }
        ],
        process: [
            { step: 1, title: "Audit", description: "Complete website analysis" },
            { step: 2, title: "Strategy", description: "Custom SEO plan development" },
            { step: 3, title: "Implementation", description: "Executing optimization tactics" },
            { step: 4, title: "Monitoring", description: "Tracking performance metrics" }
        ],
        technologies: ["Google Analytics", "SEMrush", "Ahrefs", "Moz", "Google Search Console"],
        faq: [
            {
                question: "How long does it take to see SEO results?",
                answer: "SEO is a long-term strategy. While some improvements can be seen within weeks, significant results typically take 3-6 months."
            },
            {
                question: "Do you guarantee first-page rankings?",
                answer: "We focus on sustainable SEO practices but cannot guarantee specific rankings as search engines frequently update their algorithms."
            }
        ]
    },
    'Placement Services': {
        title: "Placement Services",
        hero: "/images/services/placement-hero.jpg",
        description: "Expert career guidance and placement opportunities",
        overview: "We connect talented individuals with the best career opportunities while providing comprehensive guidance.",
        features: [
            {
                title: "Career Counseling",
                description: "Professional guidance for career path selection",
                icon: "fas fa-user-tie"
            },
            {
                title: "Interview Preparation",
                description: "Comprehensive interview coaching and mock sessions",
                icon: "fas fa-chalkboard-teacher"
            },
            {
                title: "Job Matching",
                description: "Connecting candidates with suitable opportunities",
                icon: "fas fa-handshake"
            }
        ],
        process: [
            { step: 1, title: "Profile Review", description: "Assessment of skills and experience" },
            { step: 2, title: "Career Planning", description: "Developing career roadmap" },
            { step: 3, title: "Preparation", description: "Interview and skill enhancement" },
            { step: 4, title: "Placement", description: "Job matching and applications" }
        ],
        technologies: ["LinkedIn", "Resume Builder", "Assessment Tools", "Interview Simulator"],
        faq: [
            {
                question: "How long does the placement process take?",
                answer: "The timeline varies based on individual requirements and market conditions, typically ranging from 1-3 months."
            },
            {
                question: "Do you provide post-placement support?",
                answer: "Yes, we offer continued support and guidance even after successful placement."
            }
        ]
    },
    'Video Editing': {
        title: "Video Editing",
        hero: "/images/services/video-editing-hero.jpg",
        description: "Professional video editing services to create engaging content for your brand.",
        overview: "We create engaging and professional videos that help businesses establish a strong online presence.",
        features: [
            {
                title: "Motion Graphics",
                description: "Create dynamic and engaging motion graphics for your brand",
                icon: "fas fa-video"
            },
            {
                title: "Color Grading",
                description: "Adjust the color and lighting of your videos to create a professional look",
                icon: "fas fa-palette"
            },
            {
                title: "Sound Design",
                description: "Add professional sound effects to your videos to enhance the overall experience",
                icon: "fas fa-music"
            },
            {
                title: "Video Transitions",
                description: "Add smooth transitions between scenes to create a professional look",
                icon: "fas fa-video"
            },
            {
                title: "Video Compositing",
                description: "Combine multiple video clips and elements to create a professional look",
                icon: "fas fa-video"
            },
            // Add more mobile-specific features
        ],
        process: [
            { step: 1, title: "Video Selection", description: "Selecting the best videos for your brand" },
            { step: 2, title: "Video Editing", description: "Editing the videos to create a professional look" },
            { step: 3, title: "Video Compositing", description: "Combining multiple video clips and elements to create a professional look" },
            { step: 4, title: "Video Transitions", description: "Adding smooth transitions between scenes to create a professional look" },
            { step: 5, title: "Sound Design", description: "Adding professional sound effects to your videos to enhance the overall experience" },
            { step: 6, title: "Color Grading", description: "Adjusting the color and lighting of your videos to create a professional look" },
            { step: 7, title: "Final Output", description: "Finalizing the video and exporting it" }

        ],
        technologies: ["Adobe Premiere Pro", "Adobe After Effects", "Wondershare Filmora", "Davinci Resolve", "CapCut", "Inshot", "Final Cut Pro"],
        faq: [
            {
                question: "How long does it take to edit a video?",
                answer: "The timeline varies based on the complexity of your project, typically ranging from 1-3 days."
            },
            {
                question: "Do you provide post-editing support?",
                answer: "Yes, we offer continued support and guidance even after successful editing."
            }

        ]
    },
    'Graphics Designing': {
        title: "Graphics Designing",
        hero: "/images/services/graphics-designing-hero.jpg",
        description: "We create stunning graphics for your brand to help you stand out from the competition.",
        overview: "We create stunning graphics for your brand to help you stand out from the competition. We are a team of experienced designers who are dedicated to creating stunning graphics for your brand.",
        features: [
            {
                title: "Logo Designing",
                description: "We create stunning logos for your brand to help you stand out from the competition.",
                icon: "fas fa-palette"
            },
            {
                title: "Banner Designing",
                description: "We create stunning banners for your brand to help you stand out from the competition.",
                icon: "fas fa-image"
            },
            {
                title: "Social Media Post Designing",
                description: "We create stunning social media posts for your brand to help you stand out from the competition.",
                icon: "fas fa-image"
            },
            {
                title: "Poster Designing",
                description: "We create stunning posters for your brand to help you stand out from the competition.",
                icon: "fas fa-image"
            },
            {
                title: "Card Designing",
                description: "We create stunning cards for your brand to help you stand out from the competition.",
                icon: "fas fa-image"
            },
            {
                title: "Instagram Post Designing",
                description: "We create stunning instagram posts for your brand to help you stand out from the competition.",
                icon: "fas fa-image"
            },
            {
                title: "YouTube Thumbnail Designing",
                description: "We create stunning youtube thumbnails for your brand to help you stand out from the competition.",
                icon: "fas fa-image"
            },
            {
                title: "T-Shirt Designing",
                description: "We create stunning t-shirts for your brand to help you stand out from the competition.",
                icon: "fas fa-image"
            },
            {
                title: "ID Card Designing",
                description: "We create stunning id cards for your brand to help you stand out from the competition.",
                icon: "fas fa-image"
            }
            // Add more cloud-specific features
        ],
        technologies: ["Adobe Photoshop", "Adobe Illustrator", "InDesign", "CorelDRAW", "Adobe Express", "Canva"],
        faq: [
            {
                question: "How long does it take to design a logo?",
                answer: "The timeline varies based on the complexity of your project, typically ranging from 1-3 days."
            },
            {
                question: "Do you provide post-designing support?",
                answer: "Yes, we offer continued support and guidance even after successful designing."
            }
        ],
        process: [
            { step: 1, title: "Initial Consultation", description: "Discussing your project requirements and goals" },
            { step: 2, title: "Designing", description: "Creating a design for your brand" },
            { step: 3, title: "Reviewing", description: "Reviewing and refining the design" },
            { step: 4, title: "Finalizing", description: "Finalizing the design and exporting it" }

        ]
    },
    'Social Media Management': {
        title: "Social Media Management",
        hero: "/images/services/social-media-management-hero.jpg",
        description: "We manage your social media accounts to help you grow your brand.",
        overview: "We manage your social media accounts to help you grow your brand.",
        features: [
            {
                title: "Social Media Posting",
                description: "We post on your social media accounts to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "Social Media Scheduling",
                description: "We schedule your social media posts to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "Social Media Analytics",
                description: "We analyze your social media accounts to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "Social Media Engagement",
                description: "We engage with your social media accounts to help you grow your brand.",
                icon: "fas fa-image"
            }
        ],
        process: [
            { step: 1, title: "Content Creation", description: "Creating content for your social media accounts" },
            { step: 2, title: "Content Scheduling", description: "Scheduling your social media posts" },
            { step: 3, title: "Content Engagement", description: "Engaging with your social media posts" },
            { step: 4, title: "Content Analysis", description: "Analyzing your social media posts" }
        ],
        technologies: ["Social Media Platforms", "Social Media Scheduling Tools", "Social Media Analytics Tools", "Social Media Engagement Tools"],
        faq: [
            {
                question: "How long does it take to manage a social media account?",
                answer: "The timeline varies based on the complexity of your project, typically ranging from 1-3 days."
            },
            {
                question: "Do you provide post-management support?",
                answer: "Yes, we offer continued support and guidance even after successful management."
            }
        ]
    },
    'Pay-Per-Click Advertising': {
        title: "Pay-Per-Click Advertising",
        hero: "/images/services/pay-per-click-advertising-hero.jpg",
        description: "We manage your pay-per-click advertising to help you grow your brand.",
        overview: "We manage your pay-per-click advertising to help you grow your brand.",
        features: [
            {
                title: "Pay-Per-Click Advertising",
                description: "We manage your pay-per-click advertising to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "Pay-Per-Click Advertising",
                description: "We manage your pay-per-click advertising to help you grow your brand.",
                icon: "fas fa-image"
            }
        ],
        process: [
            { step: 1, title: "Campaign Creation", description: "Creating a campaign for your brand" },
            { step: 2, title: "Campaign Management", description: "Managing your campaign" },
            { step: 3, title: "Campaign Analysis", description: "Analyzing your campaign" },
            { step: 4, title: "Campaign Optimization", description: "Optimizing your campaign" }
        ],
        technologies: ["Google Ads", "Facebook Ads", "Instagram Ads", "Twitter Ads", "LinkedIn Ads"],
        faq: [
            {
                question: "How long does it take to manage a pay-per-click advertising campaign?",
                answer: "The timeline varies based on the complexity of your project, typically ranging from 1-3 days."
            },
            {
                question: "Do you provide post-management support?",
                answer: "Yes, we offer continued support and guidance even after successful management."
            }
        ]

    },
    'Content Marketing': {
        title: "Content Marketing",
        hero: "/images/services/content-marketing-hero.jpg",
        description: "We create content for your brand to help you grow your brand.",
        overview: "We create content for your brand to help you grow your brand.",
        features: [
            {
                title: "Blog Writing",
                description: "We write blogs for your brand to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "Article Writing",
                description: "We write articles for your brand to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "Social Media Posting",
                description: "We post on your social media accounts to help you grow your brand.",
                icon: "fas fa-image"
            }
        ],
        process: [
            { step: 1, title: "Content Planning", description: "Planning your content" },
            { step: 2, title: "Content Creation", description: "Creating your content" },
            { step: 3, title: "Content Scheduling", description: "Scheduling your content" },
            { step: 4, title: "Content Promotion", description: "Promoting your content" }
        ],
        technologies: ["Grammarly", "Jasper", "WriteSonic", "WordTune", "Rytr", "Scribe", "Scalenut", "Quillbot"],
        faq: [
            {
                question: "How long does it take to create a blog?",
                answer: "The timeline varies based on the complexity of your project, typically ranging from 1-3 days."
            },
            {
                question: "Do you provide post-creation support?",
                answer: "Yes, we offer continued support and guidance even after successful creation."
            }
        ]
    },
    'Email Marketing': {
        title: "Email Marketing",
        hero: "/images/services/email-marketing-hero.jpg",
        description: "We send emails to your customers to help you grow your brand.",
        overview: "We send emails to your customers to help you grow your brand.",
        features: [
            {
                title: "Email Campaigns",
                description: "We send emails to your customers to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "Email Templates",
                description: "We create email templates for your brand to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "Email Marketing Automation",
                description: "We automate your email marketing to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "Email Marketing Analytics",
                description: "We analyze your email marketing to help you grow your brand.",
                icon: "fas fa-image"
            }
        ],
        process: [
            { step: 1, title: "Email Campaign Planning", description: "Planning your email campaign" },
            { step: 2, title: "Email Campaign Creation", description: "Creating your email campaign" },
            { step: 3, title: "Email Campaign Scheduling", description: "Scheduling your email campaign" },
            { step: 4, title: "Email Campaign Promotion", description: "Promoting your email campaign" }
        ],
        technologies: ["Mailchimp", "Sendinblue", "ActiveCampaign", "HubSpot", "Klaviyo", "SendGrid", "Mailjet", "Postmark", "Resend", "SparkPost", "Zapier"],
        faq: [
            {
                question: "How long does it take to create an email campaign?",
                answer: "The timeline varies based on the complexity of your project, typically ranging from 1-3 days."
            },
            {
                question: "Do you provide post-creation support?",
                answer: "Yes, we offer continued support and guidance even after successful creation."
            }
        ]

    },
    'E-commerce Marketing': {
        title: "E-commerce Marketing",
        hero: "/images/services/e-commerce-marketing-hero.jpg",
        description: "We market your e-commerce store to help you grow your brand.",
        overview: "We market your e-commerce store to help you grow your brand.",
        features: [
            {
                title: "E-commerce Product Listing",
                description: "We list your products on your e-commerce store to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "E-commerce Product Optimization",
                description: "We optimize your products on your e-commerce store to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "E-commerce Product Promotion",
                description: "We promote your products on your e-commerce store to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "E-commerce Product Analytics",
                description: "We analyze your products on your e-commerce store to help you grow your brand.",
                icon: "fas fa-image"
            }
        ],
        process: [
            { step: 1, title: "Product Listing", description: "Listing your products on your e-commerce store" },
            { step: 2, title: "Product Optimization", description: "Optimizing your products on your e-commerce store" },
            { step: 3, title: "Product Promotion", description: "Promoting your products on your e-commerce store" },
            { step: 4, title: "Product Analytics", description: "Analyzing your products on your e-commerce store" }
        ],
        technologies: ["Shopify", "WooCommerce", "Magento", "BigCommerce", "Squarespace", "Volusion", "ZenCart", "OpenCart", "PrestaShop", "Joomla", "Drupal"],
        faq: [
            {
                question: "How long does it take to market an e-commerce store?",
                answer: "The timeline varies based on the complexity of your project, typically ranging from 1-3 days."
            },
            {
                question: "Do you provide post-marketing support?",
                answer: "Yes, we offer continued support and guidance even after successful marketing."
            }
        ]
    },
    'Sculpting & 3D Design': {
        title: "Sculpting & 3D Design",
        hero: "/images/services/sculpting-3d-design-hero.jpg",
        description: "We sculpt and design 3D models to help you grow your brand.",
        overview: "We sculpt and design 3D models to help you grow your brand.",
        features: [
            {
                title: "Sculpting",
                description: "We sculp 3D models to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "3D Design",
                description: "We design 3D models to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "3D Rendering",
                description: "We render 3D models to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "3D Animation",
                description: "We animate 3D models to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "3D Modeling",
                description: "We model 3D models to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "3D Texturing",
                description: "We texture 3D models to help you grow your brand.",
                icon: "fas fa-image"
            },
            {
                title: "3D Lighting",
                description: "We light 3D models to help you grow your brand.",
                icon: "fas fa-image"
            }

        ],
        process: [
            { step: 1, title: "Designing", description: "Designing your 3D model" },
            { step: 2, title: "Sculpting", description: "Sculpting your 3D model" },
            { step: 3, title: "Rendering", description: "Rendering your 3D model" },
            { step: 4, title: "Animation", description: "Animating your 3D model" },
            { step: 5, title: "Modeling", description: "Modeling your 3D model" },
            { step: 6, title: "Texturing", description: "Texturing your 3D model" },
            { step: 7, title: "Lighting", description: "Lighting your 3D model" },
            { step: 8, title: "Finalizing", description: "Finalizing your 3D model" }
        ],
        technologies: ["Blender", "Maya", "3D Max", "Cinema 4D", "ZBrush", "Substance Painter", "Substance Designer", "Substance Painter", "Substance Designer", "Substance Painter", "Substance Designer"],
        faq: [
            {
                question: "How long does it take to sculpt a 3D model?",
                answer: "The timeline varies based on the complexity of your project, typically ranging from 1-3 days."
            },
            {
                question: "Do you provide post-sculpting support?",
                answer: "Yes, we offer continued support and guidance even after successful sculpting."
            }
        ]
    }
};

const ServiceDetail = () => {
    const { title } = useParams();
    const serviceDetails = servicesData[title] || servicesData['Web Development'];
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // Add these state and handler
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: '',
        message: '',
        serviceType: title || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log('Form submitted:', formData);
            // Reset form after successful submission
            setFormData({
                name: '',
                email: '',
                mobile: '',
                address: '',
                message: '',
                serviceType: title || ''
            });
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/service/submit-query`, formData);
            showToast.success('Thankyou , We\'ll contact you soon');

        } catch (error) {
            console.error('Error submitting form:', error);
            showToast.error(error.response.data.message || 'Error submitting form. Please try again.');
        } finally {
            setShowModal(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handlePhoneChange = (value) => {
        setFormData(prevState => ({
            ...prevState,
            mobile: value
        }));
    };

    useEffect(() => {
        AOS.init({
            duration: 1200,
            once: true,
            mirror: false,
            easing: 'ease-out-cubic'
        });
        console.log('Service Title', title);
        window.scrollTo(0, 0);
    }, [title]);

    return (
        <>
            {/* Header is now handled by App.jsx */}
            <div className="service-detail-page" style={{ background: 'linear-gradient(180deg, #000000,rgb(52, 78, 226))' }}>
                <section className="hero-section position-relative" style={{
                    background: 'linear-gradient(135deg, #000000 0%, rgb(52, 78, 226) 100%)',
                    padding: '120px 0 80px',
                    overflow: 'hidden'
                }}>
                    {/* Animated background elements */}
                    <div className="animated-bg">
                        <div className="floating-shape shape1"></div>
                        <div className="floating-shape shape2"></div>
                        <div className="floating-shape shape3"></div>
                    </div>

                    <div className="container position-relative">
                        <div className="row align-items-center">
                            <div className="col-lg-6" data-aos="fade-right">
                                <h1 className="display-4 fw-bold text-gradient mb-4"
                                    style={{
                                        background: 'linear-gradient(to right, #fff, #a5b4fc)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                    Transform Your Vision Into Reality
                                </h1>
                                <p className="lead mb-4"
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontSize: '1.2rem',
                                        lineHeight: '1.8'
                                    }}>
                                    {serviceDetails.description}
                                </p>
                                <div className="d-flex gap-3">
                                    <button
                                        className="btn btn-primary btn-lg"
                                        style={{
                                            background: 'linear-gradient(45deg, #4F46E5, #7C3AED)',
                                            border: 'none',
                                            padding: '12px 28px',
                                            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
                                        }}
                                        onClick={() => {
                                            if (title === 'Placement Services')
                                                navigate('/placements');
                                            else
                                                setShowModal(true);
                                        }}
                                    >
                                        Get Started
                                        <i className="fas fa-arrow-right ms-2"></i>
                                    </button>
                                    <a href="#service-details" className="btn btn-outline-light btn-lg"
                                        style={{
                                            borderWidth: '2px',
                                            padding: '12px 28px'
                                        }}>
                                        Learn More
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-6" data-aos="fade-left">
                                <div className="position-relative">
                                    <img
                                        src={serviceDetails.hero}
                                        alt={serviceDetails.title}
                                        className="img-fluid rounded-4 shadow-lg"
                                        style={{
                                            transform: 'perspective(1000px) rotateY(-15deg)',
                                            transition: 'transform 0.3s ease',
                                            border: '2px solid rgba(255, 255, 255, 0.1)',
                                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                                        }}
                                    />
                                    {/* Floating stats cards */}
                                    <div className="stats-card position-absolute"
                                        style={{
                                            top: '20px',
                                            right: '-30px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '15px 25px',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                        data-aos="fade-left"
                                        data-aos-delay="200">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-star text-warning me-2"></i>
                                            <span className="text-white">Trusted by 500+ Clients</span>
                                        </div>
                                    </div>
                                    <div className="stats-card position-absolute"
                                        style={{
                                            bottom: '20px',
                                            left: '-30px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '15px 25px',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                        data-aos="fade-right"
                                        data-aos-delay="300">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-globe text-info me-2"></i>
                                            <span className="text-white">Global Service Provider</span>
                                        </div>
                                    </div>
                                    <div className="stats-card position-absolute"
                                        style={{
                                            top: '50%',
                                            right: '-20px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '15px 25px',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                        data-aos="fade-left"
                                        data-aos-delay="400">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-clock text-success me-2"></i>
                                            <span className="text-white">24/7 Support</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="service-details" className="features-section">
                    <div className="container">
                        <h2 className="text-center mb-5">Key Features</h2>
                        <div className="row">
                            {serviceDetails.features.map((feature, index) => (
                                <div className="col-lg-4" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                                    <div className="feature-card">
                                        <div className="feature-icon">
                                            <i className={feature.icon}></i>
                                        </div>
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="process-section">
                    <div className="container">
                        <h2 className="text-center mb-5">Our Process</h2>
                        <div className="process-timeline">
                            {serviceDetails.process.map((step, index) => (
                                <div className="process-step" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                                    <div className="step-number">{step.step}</div>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="tech-stack-section">
                    <div className="container">
                        <h2 className="text-center mb-5">Technologies We Use</h2>
                        <div className="tech-grid">
                            {serviceDetails.technologies.map((tech, index) => (
                                <div className="tech-item" key={index} data-aos="zoom-in" data-aos-delay={index * 50}>
                                    {tech}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="faq-section">
                    <div className="container">
                        <h2 className="text-center mb-5">Frequently Asked Questions</h2>
                        <div className="faq-grid">
                            {serviceDetails.faq.map((item, index) => (
                                <div className="faq-item" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                                    <h3>{item.question}</h3>
                                    <p>{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="cta-section position-relative"
                    style={{
                        background: 'linear-gradient(180deg, #000000, rgb(52, 78, 226))',
                        padding: '60px 0',
                        textAlign: 'center'
                    }}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <h2 className="display-5 mb-3 text-white fw-bold">
                                    Ready To Get Started?
                                </h2>
                                <p className="lead mb-4 text-white-50">
                                    Let's discuss your project and create something amazing together
                                </p>
                                <button className="btn btn-light btn-lg px-5"
                                    style={{
                                        borderRadius: '30px',
                                        fontWeight: '500',
                                        fontSize: '1.1rem',
                                        padding: '12px 30px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-3px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                    }} 
                                    onClick={(e)=>{
                                        navigate('/contact');
                                    }}
                                    >
                                    Contact Us <i className="fas fa-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />

            {/* Service Inquiry Modal */}
            {showModal && (
                <div className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                    <div className="modal-content"
                        style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '15px',
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}>
                        <div className="modal-header d-flex justify-content-between align-items-center mb-4">
                            <h3 className="m-0">Service Inquiry Form</h3>
                            <button
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                                aria-label="Close"
                            ></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">
                                    Company/Individual Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your name or company name"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Email Address <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your email address"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Mobile Number <span className="text-danger">*</span>
                                </label>
                                <PhoneInput
                                    country={'in'}
                                    value={formData.mobile}
                                    onChange={handlePhoneChange}
                                    inputStyle={{
                                        width: '100%',
                                        height: '40px',
                                        fontSize: '16px',
                                        borderRadius: '4px',
                                        border: '1px solid #ced4da'
                                    }}
                                    buttonStyle={{
                                        borderRadius: '4px 0 0 4px',
                                        border: '1px solid #ced4da'
                                    }}
                                    containerStyle={{
                                        marginTop: '5px'
                                    }}
                                    inputProps={{
                                        required: true,
                                        name: 'mobile'
                                    }}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Address <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className="form-control"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    required
                                    placeholder="Enter your address"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Service Type <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    name="serviceType"
                                    value={formData.serviceType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a service</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="Search Engine Optimization">Search Engine Optimization</option>
                                    <option value="Video Editing">Video Editing</option>
                                    <option value="Graphics Designing">Graphics Designing</option>
                                    <option value="Social Media Management">Social Media Management</option>
                                    <option value="Pay-Per-Click Advertising">Pay-Per-Click Advertising</option>
                                    <option value="Content Marketing">Content Marketing</option>
                                    <option value="Email Marketing">Email Marketing</option>
                                    <option value="E-commerce Marketing">E-commerce Marketing</option>
                                    <option value="Sculpting & 3D Design">Sculpting & 3D Design</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Message (Optional)</label>
                                <textarea
                                    className="form-control"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Tell us about your project requirements (optional)"
                                />
                            </div>

                            <div className="d-grid gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    style={{
                                        background: 'linear-gradient(180deg, #000000, rgb(52, 78, 226))',
                                        border: 'none'
                                    }}
                                >
                                    Submit Inquiry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServiceDetail;