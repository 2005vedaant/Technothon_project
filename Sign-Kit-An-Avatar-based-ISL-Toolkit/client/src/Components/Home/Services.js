import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { WordReveal, FadeUpText, StaggerContainer, StaggerItem } from './TextAnimator';

const TiltCard = ({ children }) => {
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
        <StaggerItem 
            className="col-lg-4 col-md-6 card-3d-wrapper" 
            yOffset={35}
        >
            <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="card h-100 card-background border-0 position-relative overflow-hidden card-3d-inner" 
                style={style}
            >
                {children}
            </div>
        </StaggerItem>
    );
};

function Services() {
    return (
        <section id="services" className="py-5 position-relative" style={{ background: 'var(--bg-deep)' }}>
            
            <div className="position-absolute w-100 h-100" style={{ top: 0, left: 0, background: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

            <div className="container py-5 position-relative z-index-1">
                <div className="text-center mb-5">
                    <h2 className="section-heading text-white" style={{ fontSize: '2.5rem' }}>
                        <WordReveal text="Platform Features" as="span" delay={0.1} />
                    </h2>
                    <FadeUpText delay={0.25} duration={0.6} yOffset={10} className="divider mx-auto mb-4" style={{ background: 'linear-gradient(90deg, #00F0FF, #8B5CF6)', height: '3px', width: '60px', borderRadius: '3px' }} as="div" />
                    <FadeUpText delay={0.35} duration={0.8} yOffset={20} className="normal-text mx-auto" style={{ maxWidth: '600px' }}>
                        Explore our range of intelligent tools designed to make Indian Sign Language accessible to everyone.
                    </FadeUpText>
                </div>

                <StaggerContainer className="row g-4 justify-content-center mt-4" staggerDelay={0.14} delayChildren={0.2}>
                    
                    {/* Feature 1 */}
                    <TiltCard>
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20 blur-xl" style={{ background: 'radial-gradient(circle at top right, rgba(0, 240, 255, 0.4), transparent 50%)', pointerEvents: 'none' }}></div>
                        <div className="card-body p-5 d-flex flex-column position-relative z-index-1">
                            <div className="mb-4">
                                <i className="fa fa-language" style={{ fontSize: '3rem', color: 'var(--accent-cyan)', textShadow: 'var(--glow-cyan)' }}></i>
                            </div>
                            <h3 className="h4 fw-bold text-white mb-3">Audio to Sign</h3>
                            <p className="card-text text-muted flex-grow-1" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                                Real-time translation of spoken audio or English text into Sign Language using our responsive 3D avatars.
                            </p>
                            <Link to='/convert' className="btn btn-outline-light w-100 mt-4 rounded-pill fw-bold">
                                Try Translation
                            </Link>
                        </div>
                    </TiltCard>

                    {/* Feature 2 */}
                    <TiltCard>
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20 blur-xl" style={{ background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.4), transparent 50%)', pointerEvents: 'none' }}></div>
                        <div className="card-body p-5 d-flex flex-column position-relative z-index-1">
                            <div className="mb-4">
                                <i className="fa fa-graduation-cap" style={{ fontSize: '3rem', color: 'var(--accent-blue)', textShadow: '0 0 20px rgba(37, 99, 235, 0.4)' }}></i>
                            </div>
                            <h3 className="h4 fw-bold text-white mb-3">Learn ISL</h3>
                            <p className="card-text text-muted flex-grow-1" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                                Interactive modules for beginners to learn alphabets and basic words through 3D animations and visual feedback.
                            </p>
                            <Link to='/learn' className="btn btn-info w-100 mt-4 rounded-pill fw-bold text-dark">
                                Start Learning
                            </Link>
                        </div>
                    </TiltCard>

                    {/* Feature 3 */}
                    <TiltCard>
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20 blur-xl" style={{ background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.4), transparent 50%)', pointerEvents: 'none' }}></div>
                        <div className="card-body p-5 d-flex flex-column position-relative z-index-1">
                            <div className="mb-4">
                                <i className="fa fa-sign-language" style={{ fontSize: '3rem', color: 'var(--accent-blue)', textShadow: '0 0 20px rgba(37, 99, 235, 0.4)' }}></i>
                            </div>
                            <h3 className="h4 fw-bold text-white mb-3">Sign to Text</h3>
                            <p className="card-text text-muted flex-grow-1" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                                AI-powered real-time translation of Sign Language gestures captured from your camera into readable text and natural voice output.
                            </p>
                            <Link to='/sign-to-text' className="btn btn-outline-light w-100 mt-4 rounded-pill fw-bold">
                                Try Sign to Text
                            </Link>
                        </div>
                    </TiltCard>

                </StaggerContainer>
            </div>
        </section>
    );
}

export default Services;