import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const TiltCard = ({ children, delay }) => {
    const cardRef = useRef(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        
        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'none'
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
        });
    };

    return (
        <div 
            className="col-lg-4 col-md-6 fade-in-up card-3d-wrapper" 
            style={{ animationDelay: delay }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={cardRef}
        >
            <div className="card h-100 card-background border-0 position-relative overflow-hidden card-3d-inner" style={style}>
                {children}
            </div>
        </div>
    );
};

function Services() {
    return (
        <section id="services" className="py-5 position-relative" style={{ background: 'var(--bg-deep)' }}>
            
            <div className="position-absolute w-100 h-100" style={{ top: 0, left: 0, background: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

            <div className="container py-5 position-relative z-index-1">
                <div className="text-center mb-5 fade-in-up">
                    <h2 className="section-heading text-white" style={{ fontSize: '2.5rem' }}>Platform Features</h2>
                    <div className="divider mx-auto mb-4" style={{ background: 'linear-gradient(90deg, #00F0FF, #8B5CF6)', height: '3px', width: '60px', borderRadius: '3px' }} />
                    <p className="normal-text mx-auto" style={{ maxWidth: '600px' }}>
                        Explore our range of intelligent tools designed to make Indian Sign Language accessible to everyone.
                    </p>
                </div>

                <div className="row g-4 justify-content-center mt-4">
                    
                    {/* Feature 1 */}
                    <TiltCard delay="0.1s">
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20 blur-xl" style={{ background: 'radial-gradient(circle at top right, rgba(0, 240, 255, 0.4), transparent 50%)', pointerEvents: 'none' }}></div>
                        <div className="card-body p-5 d-flex flex-column position-relative z-index-1">
                            <div className="mb-4">
                                <i className="fa fa-language" style={{ fontSize: '3rem', color: 'var(--accent-cyan)', textShadow: 'var(--glow-cyan)' }}></i>
                            </div>
                            <h3 className="h4 fw-bold text-white mb-3">Audio to Sign</h3>
                            <p className="card-text text-muted flex-grow-1" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                                Real-time translation of spoken audio or English text into Indian Sign Language using our responsive 3D avatars.
                            </p>
                            <Link to='/sign-kit/convert' className="btn btn-outline-light w-100 mt-4 rounded-pill fw-bold">
                                Try Translation
                            </Link>
                        </div>
                    </TiltCard>

                    {/* Feature 2 */}
                    <TiltCard delay="0.2s">
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20 blur-xl" style={{ background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.4), transparent 50%)', pointerEvents: 'none' }}></div>
                        <div className="card-body p-5 d-flex flex-column position-relative z-index-1">
                            <div className="mb-4">
                                <i className="fa fa-graduation-cap" style={{ fontSize: '3rem', color: 'var(--accent-blue)', textShadow: '0 0 20px rgba(37, 99, 235, 0.4)' }}></i>
                            </div>
                            <h3 className="h4 fw-bold text-white mb-3">Learn ISL</h3>
                            <p className="card-text text-muted flex-grow-1" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                                Interactive modules for beginners to learn alphabets and basic words through 3D animations and visual feedback.
                            </p>
                            <Link to='/sign-kit/learn-sign' className="btn btn-info w-100 mt-4 rounded-pill fw-bold text-dark">
                                Start Learning
                            </Link>
                        </div>
                    </TiltCard>

                    {/* Feature 3 */}
                    <TiltCard delay="0.3s">
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20 blur-xl" style={{ background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.4), transparent 50%)', pointerEvents: 'none' }}></div>
                        <div className="card-body p-5 d-flex flex-column position-relative z-index-1">
                            <div className="mb-4">
                                <i className="fa fa-play-circle" style={{ fontSize: '3rem', color: 'var(--accent-violet)', textShadow: 'var(--glow-violet)' }}></i>
                            </div>
                            <h3 className="h4 fw-bold text-white mb-3">Video Community</h3>
                            <p className="card-text text-muted flex-grow-1" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                                Create and share ISL videos with the community. Convert your stories into sign language effortlessly.
                            </p>
                            <Link to='/sign-kit/all-videos' className="btn btn-outline-light w-100 mt-4 rounded-pill fw-bold">
                                Explore Videos
                            </Link>
                        </div>
                    </TiltCard>

                </div>
            </div>
        </section>
    );
}

export default Services;
