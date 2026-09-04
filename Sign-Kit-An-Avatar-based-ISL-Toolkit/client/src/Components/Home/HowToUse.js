import React from 'react';

const steps = [
  {
    step: '01',
    title: 'Choose Your Mode',
    description: 'Select Audio/Text to Sign or Sign to Text/Audio (AI) from the navigation menu based on how you want to communicate.',
    icon: 'fa-exchange',
    accentColor: '#00F0FF'
  },
  {
    step: '02',
    title: 'Provide Your Input',
    description: 'For Audio/Text to Sign, speak clearly using your microphone or write text properly. For Sign to Text, use your camera to perform Sign Language gestures.',
    icon: 'fa-microphone',
    accentColor: '#3B82F6'
  },
  {
    step: '03',
    title: 'Let Mitra AI Process',
    description: 'Mitra AI uses AI-powered speech recognition, translation, and sign-language recognition to understand your input in real time.',
    icon: 'fa-cogs',
    accentColor: '#8B5CF6'
  },
  {
    step: '04',
    title: 'Get the Result',
    description: 'View the corresponding Sign Language animation or receive the recognized text, making communication easier and more accessible.',
    icon: 'fa-check-circle',
    accentColor: '#10B981'
  }
];

function HowToUse() {
  return (
    <section id="how-to-use" className="py-5 position-relative" style={{ background: 'var(--bg-deep)' }}>
      {/* Background radial ambient glow */}
      <div 
        className="position-absolute w-100 h-100" 
        style={{ 
          top: 0, 
          left: 0, 
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.04) 0%, transparent 70%)', 
          pointerEvents: 'none' 
        }} 
      />

      <div className="container py-5 position-relative z-index-1">
        {/* Section Header */}
        <div className="text-center mb-5 fade-in-up">
          <h2 className="section-heading text-white" style={{ fontSize: '2.5rem' }}>
            How to Use Mitra AI?
          </h2>
          <div 
            className="divider mx-auto mb-4" 
            style={{ 
              background: 'linear-gradient(90deg, #00F0FF, #3B82F6)', 
              height: '3px', 
              width: '60px', 
              borderRadius: '3px' 
            }} 
          />
          <p className="normal-text mx-auto" style={{ maxWidth: '650px' }}>
            Communicate effortlessly with Indian Sign Language using Mitra AI.
          </p>
        </div>

        {/* 4 Steps Row */}
        <div className="row g-4 justify-content-center mt-2">
          {steps.map((s, idx) => (
            <div key={idx} className="col-lg-3 col-md-6 fade-in-up card-3d-wrapper" style={{ animationDelay: `${(idx + 1) * 0.1}s` }}>
              <div 
                className="card h-100 card-background border-0 position-relative overflow-hidden p-4 d-flex flex-column"
                style={{
                  border: '1px solid var(--border-glass)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                {/* Subtle top glow per step */}
                <div 
                  className="position-absolute top-0 start-0 w-100 opacity-20 pointer-events-none"
                  style={{
                    height: '100px',
                    background: `radial-gradient(circle at top right, ${s.accentColor}, transparent 70%)`
                  }}
                />

                {/* Step Badge & Icon */}
                <div className="d-flex align-items-center justify-content-between mb-4 position-relative z-index-1">
                  <span 
                    className="fw-bold px-3 py-1 rounded-pill"
                    style={{ 
                      fontSize: '0.9rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: s.accentColor,
                      border: `1px solid ${s.accentColor}50`,
                      boxShadow: `0 0 12px ${s.accentColor}30`
                    }}
                  >
                    {s.step}
                  </span>
                  <i 
                    className={`fa ${s.icon}`} 
                    style={{ 
                      fontSize: '2rem', 
                      color: s.accentColor, 
                      filter: `drop-shadow(0 0 10px ${s.accentColor}50)` 
                    }}
                  />
                </div>

                {/* Step Title */}
                <h3 className="h5 fw-bold text-white mb-3 position-relative z-index-1">
                  {s.title}
                </h3>

                {/* Step Description */}
                <p className="card-text text-muted flex-grow-1 position-relative z-index-1" style={{ fontSize: '0.95rem', lineHeight: '1.65' }}>
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowToUse;
