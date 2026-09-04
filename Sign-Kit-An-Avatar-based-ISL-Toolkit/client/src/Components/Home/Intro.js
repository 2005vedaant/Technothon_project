import React from "react";

function Intro() {
  return (
    <section id="intro" className="py-5 position-relative overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Decorative digital scanning lines */}
      <div className="position-absolute w-100 h-100 top-0 start-0 pointer-events-none opacity-5" 
           style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.1) 2px, rgba(0, 240, 255, 0.1) 4px)' }}></div>
      
      <div className="container py-5 position-relative z-index-1 fade-in-up">
        <div className="row align-items-center justify-content-center g-5">
          <div className="col-lg-8 text-center glass-panel p-5 position-relative overflow-hidden">
            
            {/* Subtle glow behind text inside the panel */}
            <div className="position-absolute top-50 start-50 translate-middle w-100 h-100 opacity-25" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>

            <div className="position-relative z-index-1">
                <div className="d-inline-block mb-4">
                    <i className="fa fa-connectdevelop text-info" style={{ fontSize: '2.5rem', textShadow: 'var(--glow-cyan)' }}></i>
                </div>
                <h2 className="section-heading mb-4 text-white" style={{ fontSize: '2.2rem' }}>What is Mitra AI?</h2>
                <div className="divider mx-auto mb-5" style={{ background: 'linear-gradient(90deg, #00F0FF, #3B82F6)', height: '3px', width: '60px', borderRadius: '3px' }} />
                
                <p className="normal-text mb-4 text-center mx-auto" style={{ fontSize: '1.15rem', lineHeight: '1.8' }}>
                Indian Sign Language (ISL) is a vital medium of communication for millions of individuals in India. However, the lack of widespread ISL literacy creates a significant communication gap in everyday life.
                </p>
                <p className="normal-text text-center mx-auto" style={{ fontSize: '1.15rem', lineHeight: '1.8' }}>
                <strong>Mitra AI</strong> is a cutting-edge, accessibility-first toolkit designed to bridge communication gaps through two-way Indian Sign Language interaction. It translates written or spoken language into responsive 3D Sign Language in real time, while also recognizing Sign Language gestures and converting them into text and speech. By enabling seamless communication between signers and non-signers, Mitra AI empowers users to communicate effectively and fosters greater inclusivity and understanding.
                </p>
                <p className="normal-text text-center mx-auto" style={{ fontSize: '1.15rem', lineHeight: '1.8' }}>

                </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intro;
