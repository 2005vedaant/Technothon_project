import React, { useState } from 'react';
import AvatarCanvas from './AvatarCanvas.js';// Adjust path if placed in components

function SignToText() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [translatedSentence, setTranslatedSentence] = useState('');
  const [status, setStatus] = useState('Idle');

  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleStart = () => {
    setIsTranslating(true);
    setStatus('Active - Listening for Gestures');
  };

  const handleStop = () => {
    setIsTranslating(false);
    setStatus('Idle');
  };

  const handleClear = () => {
    setDetectedText('');
    setTranslatedSentence('');
  };
// REPLACE YOUR EXISTING handleSpeak WITH THIS:
  const handleSpeak = () => {
    const textToSpeak = translatedSentence || detectedText;
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-100 min-vh-100 py-5 text-light" style={{ background: 'var(--bg-deep, #050811)', marginTop: '60px' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="fw-bold text-white mb-1">Sign to Text (AI)</h2>
          <p className="text-muted small">Perform sign language in front of the camera and watch real-time translation.</p>
        </div>

        {/* Stacked Vertical Layout */}
        <div className="row g-4">
          
          {/* Top Section: Full Width Camera Feed */}
          <div className="col-12">
            <div 
              className="p-3 rounded-4 position-relative overflow-hidden d-flex flex-column align-items-center justify-content-center" 
              style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                border: '1px solid rgba(0, 240, 255, 0.2)', 
                minHeight: '450px' 
              }}
            >
              {/* Top Badges */}
              <div className="position-absolute top-0 start-0 m-3 d-flex align-items-center gap-2 px-3 py-1 rounded-3" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <i className="fa fa-video-camera text-info small"></i>
                <span className="small fw-bold text-white">AI Vision Feed</span>
              </div>

              <div className="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-3" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                <span className="small fw-bold text-danger">OFFLINE</span>
              </div>

              {/* Camera Offline Placeholder */}
              <div className="text-center my-auto p-4">
                <i className="fa fa-exclamation-triangle text-warning display-4 mb-3"></i>
                <h4 className="fw-bold text-white mb-2">Camera Stream Offline</h4>
                <p className="text-muted small mb-0">Ensure the AI backend is running on port 8080.</p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Live Transcription Panel */}
          <div className="col-12">
            <div 
              className="p-4 rounded-4" 
              style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="fa fa-comments text-info fs-4"></i>
                <h3 className="h5 fw-bold text-white mb-0">Live Transcription</h3>
              </div>

              {/* Detected Sentence Box */}
              <div className="mb-4">
                <label className="form-label small text-muted fw-bold text-uppercase">Detected Sentence</label>
                <div 
                  className="p-3 rounded-3 text-light d-flex align-items-center" 
                  style={{ 
                    minHeight: '120px', 
                    background: 'rgba(5, 8, 17, 0.9)', 
                    border: '1px solid rgba(0, 240, 255, 0.2)' 
                  }}
                >
                  {detectedText ? (
                    <span className="fs-5 text-info">{detectedText}</span>
                  ) : (
                    <span className="text-muted italic">Waiting for gestures...</span>
                  )}
                </div>
              </div>

              {/* Controls Layout */}
              <div className="d-flex flex-column gap-3">
                
                {/* Row 1: Start Translating & Languages */}
                <div className="row g-3">
                  <div className="col-md-6">
                    {!isTranslating ? (
                      <button onClick={handleStart} className="btn btn-info w-100 py-2.5 fw-bold text-dark rounded-3">
                        <i className="fa fa-play me-2"></i> Start Translating
                      </button>
                    ) : (
                      <button onClick={handleStop} className="btn btn-danger w-100 py-2.5 fw-bold rounded-3">
                        <i className="fa fa-stop me-2"></i> Stop Translating
                      </button>
                    )}
                  </div>

                  <div className="col-md-6">
                    <button className="btn btn-outline-light w-100 py-2.5 fw-bold rounded-3">
                      <i className="fa fa-globe me-2"></i> Languages
                    </button>
                  </div>
                </div>

                {/* Row 2: Translated Sentence Display Space */}
                <div>
                  <div 
                    className="p-3 rounded-3 d-flex align-items-center" 
                    style={{ 
                      minHeight: '60px',
                      background: 'rgba(5, 8, 17, 0.8)', 
                      border: '1px solid rgba(255, 193, 7, 0.4)' 
                    }}
                  >
                    {translatedSentence ? (
                      <span className="fw-semibold text-warning fs-6">{translatedSentence}</span>
                    ) : (
                      <span className="text-muted small italic opacity-75">
                        <i className="fa fa-language me-2 text-warning"></i>
                        Translated sentences will appear here...
                      </span>
                    )}
                  </div>
                </div>

               {/* Row 3: Taller & Narrower Speak / Clear Buttons + Avatar */}
{/* Row 3: Taller & Narrower Speak / Clear Buttons + Avatar */}
  <div className="row g-3">
    {/* Left Column: Speak & Clear Buttons */}
    <div className="col-md-4 d-flex flex-column gap-3">
      <button 
        onClick={handleSpeak} 
        className="btn btn-outline-info w-100 py-5 fs-5 fw-bold rounded-3 shadow-sm"
      >
        <i className="fa fa-volume-up me-2"></i> Speak
      </button>
      <button 
        onClick={handleClear} 
        className="btn btn-outline-danger w-100 py-5 fs-5 fw-bold rounded-3 shadow-sm"
      >
        <i className="fa fa-trash me-2"></i> Clear
      </button>
    </div>

    {/* Right Column: 3D Avatar Area */}
    <div className="col-md-8">
      {/* UPDATE THIS COMPONENT CALL HERE: */}
      <AvatarCanvas isSpeaking={isSpeaking} />
    </div>
  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
  );
}

export default SignToText;