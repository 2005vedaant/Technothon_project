// SignToText.js - Reengineered detection polling lifecycle
import React, { useState, useEffect, useRef } from 'react';
import AvatarCanvas from './AvatarCanvas.js'; // Adjust path if placed in components
import { getPredictiveSuggestions } from '../utils/predictiveEngine';

const BACKEND_URL = process.env.REACT_APP_TECHNOTHON_API || 'http://127.0.0.1:8080';

// Existing polling interval (used previously in the code)
const EXISTING_POLL_INTERVAL = 500; // ms

const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi (हिंदी)' },
  { code: 'en-IN', name: 'English' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
  { code: 'or-IN', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'as-IN', name: 'Assamese (অসমীয়া)' },
  { code: 'ur-IN', name: 'Urdu (اردو)' },
];

function SignToText() {
  // UI state hooks
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [translatedSentence, setTranslatedSentence] = useState('');
  const [status, setStatus] = useState('Active - Listening for Gestures');
  const [cameraOnline, setCameraOnline] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Camera UI toggle state
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraStreamKey, setCameraStreamKey] = useState(0);

  // Predictive Suggestions state
  const [suggestions, setSuggestions] = useState([]);

  // ---- Detection lifecycle refs (single source of truth) ----
  const pollingIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);
  const detectionSessionRef = useRef(0);
  const cameraEnabledRef = useRef(false);
  const inactivityTimerRef = useRef(null);
  const suggestionJustSelectedRef = useRef(false);

  // Keep cameraEnabledRef in sync with state so async callbacks see latest value
  useEffect(() => {
    cameraEnabledRef.current = cameraEnabled;
  }, [cameraEnabled]);

  // ----------------------------------------------------------
  // Detection session management
  // ----------------------------------------------------------
  const startDetectionSession = () => {
    // Clean up any previous polling / aborts
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // New session ID and enable detection
    const sessionId = ++detectionSessionRef.current;
    cameraEnabledRef.current = true;
    console.log(`[Detection Session] START: ${sessionId}`);

    // Immediate poll then schedule interval
    pollWord(sessionId);
    pollingIntervalRef.current = setInterval(() => pollWord(sessionId), EXISTING_POLL_INTERVAL);
  };

  const stopDetectionSession = () => {
    const stopped = detectionSessionRef.current;
    // Increment session to invalidate any in‑flight requests
    ++detectionSessionRef.current;
    // Mark camera OFF after increment
    cameraEnabledRef.current = false;
    console.log(`[Detection Session] STOP: ${stopped}`);

    // Cleanup interval and abort controller
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Clear inactivity timer (sentence stays)
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  // ----------------------------------------------------------
  // Core polling function – single /word fetch
  // ----------------------------------------------------------
  const pollWord = async (sessionId) => {
    if (!cameraEnabledRef.current) {
      console.log('[Detection] IGNORED – camera OFF');
      return;
    }
    if (sessionId !== detectionSessionRef.current) {
      console.log('[Detection] IGNORED – stale session');
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    console.log(`[Detection] REQUEST: ${sessionId}`);
    try {
      const response = await fetch(`${BACKEND_URL}/word`, { signal: controller.signal, cache: 'no-store' });
      // Validate after fetch
      if (!cameraEnabledRef.current) {
        console.log('[Detection] IGNORED – camera OFF after fetch');
        return;
      }
      if (sessionId !== detectionSessionRef.current) {
        console.log('[Detection] IGNORED – stale session after fetch');
        return;
      }
      const data = await response.json();
      if (!cameraEnabledRef.current) {
        console.log('[Detection] IGNORED – camera OFF after parse');
        return;
      }
      if (sessionId !== detectionSessionRef.current) {
        console.log('[Detection] IGNORED – stale session after parse');
        return;
      }
      if (!data || !data.word) return;
      console.log(`[Detection] ACCEPTED: ${data.word} (session ${sessionId})`);
      processDetectedWord(data.word);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[Detection] ABORTED');
      } else {
        console.error('[Detection] error fetching /word:', err);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  // ----------------------------------------------------------
  // Process each accepted word – duplicate guard & inactivity timer
  // ----------------------------------------------------------
  const processDetectedWord = (word) => {
    if (!cameraEnabledRef.current) {
      console.log('[Detection] IGNORED – camera OFF in processor');
      return;
    }
    setDetectedText((prev) => {
      if (!word) return prev;

      // Prevent immediate duplicate polling of the exact same sign/word
      if (prev && prev.endsWith(word)) return prev;

      let updated = '';
      if (suggestionJustSelectedRef.current) {
        // Insert space before a new manual sign if a suggestion was just clicked
        const needSpace = prev && !prev.endsWith(' ');
        updated = needSpace ? prev + ' ' + word : (prev || '') + word;
        suggestionJustSelectedRef.current = false;
      } else {
        // Append detected sign directly to current word without space
        updated = (prev || '') + word;
      }

      // Reset inactivity timer (EXACTLY 8000 ms / 8 s)
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        setDetectedText((curr) => {
          if (!curr || !curr.trim()) return curr;
          if (curr.endsWith(' ')) return curr;
          return curr + ' ';
        });
        inactivityTimerRef.current = null;
      }, 5000);

      return updated;
    });
  };

  // ----------------------------------------------------------
  // Predictive Word Suggestions logic & click handler
  // ----------------------------------------------------------
  useEffect(() => {
    try {
      if (!detectedText || !detectedText.trim()) {
        setSuggestions([]);
      } else {
        const preds = getPredictiveSuggestions(detectedText, 4);
        setSuggestions(preds || []);
      }
    } catch (err) {
      console.error('[PredictiveEngine] Error generating suggestions:', err);
      setSuggestions([]);
    }
  }, [detectedText]);

  const handleSelectSuggestion = (word) => {
    if (!word) return;
    setDetectedText((prev) => {
      const current = (prev || '').trimEnd();
      if (!current) return word;
      // Insert space IMMEDIATELY BEFORE selected suggestion, NO space after it
      return current + ' ' + word;
    });

    // Flag that a suggestion was selected so the next manual sign starts with a space
    suggestionJustSelectedRef.current = true;

    // Reset inactivity timer (8 s) when a suggestion is clicked
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setDetectedText((curr) => {
        if (!curr || !curr.trim()) return curr;
        if (curr.endsWith(' ')) return curr;
        return curr + ' ';
      });
      inactivityTimerRef.current = null;
    }, 5000);
  };

  // ----------------------------------------------------------
  // UI handlers for camera ON/OFF – tie into session management
  // ----------------------------------------------------------
  const handleCameraOn = () => {
    setCameraEnabled(true);
    setCameraStreamKey((k) => k + 1);
    startDetectionSession();
  };

  const handleCameraOff = () => {
    stopDetectionSession();
    setCameraEnabled(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetectionSession();
    };
  }, []);

  // ----------------------------------------------------------
  // Translation handlers (unchanged logic)
  // ----------------------------------------------------------
  const handleStartTranslating = async () => {
    if (!detectedText.trim()) return;
    setIsTranslating(true);
    try {
      const lang = selectedLanguage.code.split('-')[0];
      const res = await fetch(`${BACKEND_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: detectedText, target: lang }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.translated_text) {
          setTranslatedSentence(data.translated_text);
        } else {
          setTranslatedSentence(detectedText);
        }
      } else {
        setTranslatedSentence(detectedText);
      }
    } catch (e) {
      console.error('Translation error:', e);
      setTranslatedSentence(detectedText);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClear = async () => {
    setDetectedText('');
    setTranslatedSentence('');
    setSuggestions([]);
    suggestionJustSelectedRef.current = false;
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    try {
      await fetch(`${BACKEND_URL}/clear`, { cache: 'no-store' });
    } catch (e) {
      // ignore
    }
  };

  const handleSpeak = () => {
    const text = translatedSentence || detectedText;
    if (!text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = selectedLanguage.code;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  // ----------------------------------------------------------
  // Render UI (identical layout to original, only handlers changed)
  // ----------------------------------------------------------
  return (
    <div className="w-100 min-vh-100 py-5 text-light" style={{ background: 'var(--bg-deep, #050811)' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-white mb-1">Intelligent Sign Recognition</h2>
          <p className="text-muted small">Perform sign language in front of the camera and watch real-time translation.</p>
        </div>
        <div className="d-flex justify-content-center mb-3">
          <button className={`btn ${cameraEnabled ? 'btn-primary' : 'btn-outline-primary'} me-2`} onClick={handleCameraOn} disabled={cameraEnabled}>ON</button>
          <button className={`btn ${!cameraEnabled ? 'btn-primary' : 'btn-outline-primary'}`} onClick={handleCameraOff} disabled={!cameraEnabled}>OFF</button>
        </div>
        <div className="row g-4">
          <div className="col-12">
            <div className="p-3 rounded-4 position-relative overflow-hidden d-flex flex-column align-items-center justify-content-center" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(0, 240, 255, 0.2)', minHeight: '450px' }}>
              <div className="position-absolute top-0 start-0 m-3 d-flex align-items-center gap-2 px-3 py-1 rounded-3" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 10 }}>
                <i className="fa fa-video-camera text-info small"></i>
                <span className="small fw-bold text-white">AI Vision Feed</span>
              </div>
              {cameraEnabled && (
                <>
                  <div className="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-3"
                    style={{
                      background: cameraOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      border: cameraOnline ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                      zIndex: 10,
                    }}
                  >
                    <span className={`small fw-bold ${cameraOnline ? 'text-success' : 'text-danger'}`}>{cameraOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  </div>

                  <img
                    key={cameraStreamKey}
                    src={`${BACKEND_URL}/video?t=${cameraStreamKey}`}
                    alt="AI Vision Feed"
                    onLoad={() => setCameraOnline(true)}
                    onError={() => setCameraOnline(false)}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '480px',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      display: 'block',
                    }}
                  />

                  {!cameraOnline && (
                    <div className="text-center my-auto p-4">
                      <i className="fa fa-exclamation-triangle text-warning display-4 mb-3"></i>
                      <h4 className="fw-bold text-white mb-2">Camera Stream Offline</h4>
                      <p className="text-muted small mb-0">Ensure the AI backend is running on port 8080.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="col-12">
            <div className="p-4 rounded-4" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="fa fa-comments text-info fs-4"></i>
                <h3 className="h5 fw-bold text-white mb-0">Live Transcription</h3>
              </div>
              <div className="mb-4">
                <label className="form-label small text-muted fw-bold text-uppercase">Detected Sentence</label>
                <div className="p-3 rounded-3 text-light d-flex align-items-center" style={{ minHeight: '120px', background: 'rgba(5, 8, 17, 0.9)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                  {detectedText ? <span className="fs-5 text-info">{detectedText}</span> : <span className="text-muted italic">Waiting for gestures...</span>}
                </div>
              </div>

              {suggestions && suggestions.length > 0 && detectedText && detectedText.trim() && (
                <div className="mb-4 p-3 rounded-3" style={{ background: 'rgba(5, 8, 17, 0.7)', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="fa fa-lightbulb-o text-warning small"></i>
                    <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Suggested Next Words</span>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {suggestions.map((w, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(w)}
                        className="btn btn-sm px-3 py-1.5 rounded-pill text-info fw-semibold"
                        style={{
                          background: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 240, 255, 0.25)';
                          e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.6)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                        }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="d-flex flex-column gap-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <button onClick={handleStartTranslating} disabled={isTranslating || !detectedText.trim()} className="btn btn-info w-100 py-2.5 fw-bold text-dark rounded-3">
                      {isTranslating ? (<><i className="fa fa-spinner fa-spin me-2"></i> Translating...</>) : (<><i className="fa fa-play me-2"></i> Start Translating</>) }
                    </button>
                  </div>
                  <div className="col-md-6 position-relative">
                    <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="btn btn-outline-light w-100 py-2.5 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2">
                      <i className="fa fa-globe text-info"></i>
                      <span>Languages ({selectedLanguage.name})</span>
                      <i className={`fa fa-chevron-${showLanguageMenu ? 'up' : 'down'} small opacity-75 ms-1`}></i>
                    </button>
                    {showLanguageMenu && (
                      <div className="position-absolute top-100 start-0 w-100 mt-2 p-2 rounded-3 glass-panel shadow-lg" style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(0, 240, 255, 0.3)', maxHeight: '260px', overflowY: 'auto', zIndex: 1050 }}>
                        <div className="small fw-bold text-muted px-2 py-1 mb-1 text-uppercase">Select Target Language</div>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <button key={lang.code} onClick={() => { setSelectedLanguage(lang); setShowLanguageMenu(false); }} className={`w-100 text-start btn btn-sm py-2 px-3 mb-1 rounded-2 d-flex align-items-center justify-content-between ${selectedLanguage.code === lang.code ? 'btn-info text-dark fw-bold' : 'btn-outline-dark text-light'}`} style={{ border: selectedLanguage.code === lang.code ? 'none' : '1px solid rgba(255,255,255,0.1)', background: selectedLanguage.code === lang.code ? 'var(--accent-cyan)' : 'rgba(5,8,17,0.6)' }}>
                            <span>{lang.name}</span>
                            <span className="small opacity-75">({lang.code})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="p-3 rounded-3 d-flex align-items-center" style={{ minHeight: '60px', background: 'rgba(5, 8, 17, 0.8)', border: '1px solid rgba(255, 193, 7, 0.4)' }}>
                    {translatedSentence ? <span className="fw-semibold text-warning fs-6">{translatedSentence}</span> : <span className="text-muted small italic opacity-75"><i className="fa fa-language me-2 text-warning"></i> Translated sentences will appear here...</span>}
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-4 d-flex flex-column gap-3">
                    <button onClick={handleSpeak} className="btn btn-outline-info w-100 py-5 fs-5 fw-bold rounded-3 shadow-sm"><i className="fa fa-volume-up me-2"></i> Speak</button>
                    <button onClick={handleClear} className="btn btn-outline-danger w-100 py-5 fs-5 fw-bold rounded-3 shadow-sm"><i className="fa fa-trash me-2"></i> Clear</button>
                  </div>
                  <div className="col-md-8">
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
