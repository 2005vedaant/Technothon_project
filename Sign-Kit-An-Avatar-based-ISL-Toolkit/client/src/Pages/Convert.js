import '../App.css'
import React, { useState, useEffect, useRef } from "react";
import Slider from 'react-input-slider';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

import xbot from '../Models/xbot/xbot.glb';
import ybot from '../Models/ybot/ybot.glb';
import xbotPic from '../Models/xbot/xbot.png';
import ybotPic from '../Models/ybot/ybot.png';

import * as words from '../Animations/words';
import * as alphabets from '../Animations/alphabets';
import { defaultPose } from '../Animations/defaultPose';

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// ── Supported Indian languages for Browser SpeechRecognition ──────────────────
const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi (hi-IN)' },
  { code: 'en-IN', label: 'English (en-IN)' },
  { code: 'bn-IN', label: 'Bengali (bn-IN)' },
  { code: 'te-IN', label: 'Telugu (te-IN)' },
  { code: 'ta-IN', label: 'Tamil (ta-IN)' },
  { code: 'mr-IN', label: 'Marathi (mr-IN)' },
  { code: 'gu-IN', label: 'Gujarati (gu-IN)' },
  { code: 'kn-IN', label: 'Kannada (kn-IN)' },
  { code: 'ml-IN', label: 'Malayalam (ml-IN)' },
  { code: 'or-IN', label: 'Odia (or-IN)' },
  { code: 'pa-IN', label: 'Punjabi (pa-IN)' },
  { code: 'as-IN', label: 'Assamese (as-IN)' },
  { code: 'ur-IN', label: 'Urdu (ur-IN)' },
];

const SPEECH_RECOGNITION_LANG_MAP = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'te': 'te-IN',
  'ta': 'ta-IN',
  'mr': 'mr-IN',
  'gu': 'gu-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'or': 'or-IN',
  'pa': 'pa-IN',
  'as': 'as-IN',
  'ur': 'ur-IN',
  'en-IN': 'en-IN',
  'hi-IN': 'hi-IN',
  'bn-IN': 'bn-IN',
  'te-IN': 'te-IN',
  'ta-IN': 'ta-IN',
  'mr-IN': 'mr-IN',
  'gu-IN': 'gu-IN',
  'kn-IN': 'kn-IN',
  'ml-IN': 'ml-IN',
  'or-IN': 'or-IN',
  'pa-IN': 'pa-IN',
  'as-IN': 'as-IN',
  'ur-IN': 'ur-IN',
};

const getSpeechRecognitionLanguage = (lang) => {
  if (!lang) return 'hi-IN';
  return SPEECH_RECOGNITION_LANG_MAP[lang] || lang;
};

const getSourceLanguageCode = (lang) => {
  if (!lang) return 'hi';
  const base = lang.split('-')[0].toLowerCase();
  return base;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Convert() {
  const [text, setText] = useState("");
  const [bot, setBot] = useState(ybot);
  const [speed, setSpeed] = useState(0.1);
  const [pause, setPause] = useState(800);

  // ── Voice & language state ────────────────────────────────────────────────
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [status, setStatus]             = useState('');
  const [statusType, setStatusType]     = useState('info');   // info | error | success
  const [isRecording, setIsRecording]   = useState(false);
  const [detectedLang, setDetectedLang] = useState('');
  const [englishText, setEnglishText]   = useState('');
  const [showDebug, setShowDebug]       = useState(false);
  const [debugInfo, setDebugInfo]       = useState({});
  const [ttsLoading, setTtsLoading]     = useState(false);

  const recognitionRef  = useRef(null);
  const isRecordingRef  = useRef(false);
  const selectedLangRef = useRef(selectedLang);

  useEffect(() => {
    selectedLangRef.current = selectedLang;
  }, [selectedLang]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
    };
  }, []);

  const componentRef = useRef({});
  const { current: ref } = componentRef;

  let textFromInput = React.createRef();

  // ── 3D scene setup ────────────────────────────────────────────────────────
  useEffect(() => {
    ref.flag = false;
    ref.pending = false;
    ref.animations = [];
    ref.characters = [];

    ref.scene = new THREE.Scene();
    ref.scene.background = new THREE.Color(0xdddddd);

    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(0, 5, 5);
    ref.scene.add(spotLight);
    ref.renderer = new THREE.WebGLRenderer({ antialias: true });

    ref.camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth * 0.57 / (window.innerHeight - 70),
      0.1,
      1000
    );
    ref.renderer.setSize(window.innerWidth * 0.57, window.innerHeight - 70);

    document.getElementById("canvas").innerHTML = "";
    document.getElementById("canvas").appendChild(ref.renderer.domElement);

    ref.camera.position.z = 1.6;
    ref.camera.position.y = 1.4;

    let loader = new GLTFLoader();
    loader.load(
      bot,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.type === 'SkinnedMesh') {
            child.frustumCulled = false;
          }
        });
        ref.avatar = gltf.scene;
        ref.scene.add(ref.avatar);
        defaultPose(ref);
      },
      (xhr) => { console.log(xhr); }
    );
  }, [ref, bot]);

  // ── Animation loop ────────────────────────────────────────────────────────
  ref.animate = () => {
    if (ref.animations.length === 0) {
      ref.pending = false;
      return;
    }
    requestAnimationFrame(ref.animate);
    if (ref.animations[0].length) {
      if (!ref.flag) {
        if (ref.animations[0][0] === 'add-text') {
          setText(text + ref.animations[0][1]);
          ref.animations.shift();
        } else {
          for (let i = 0; i < ref.animations[0].length;) {
            let [boneName, action, axis, limit, sign] = ref.animations[0][i];
            if (sign === "+" && ref.avatar.getObjectByName(boneName)[action][axis] < limit) {
              ref.avatar.getObjectByName(boneName)[action][axis] += speed;
              ref.avatar.getObjectByName(boneName)[action][axis] = Math.min(ref.avatar.getObjectByName(boneName)[action][axis], limit);
              i++;
            } else if (sign === "-" && ref.avatar.getObjectByName(boneName)[action][axis] > limit) {
              ref.avatar.getObjectByName(boneName)[action][axis] -= speed;
              ref.avatar.getObjectByName(boneName)[action][axis] = Math.max(ref.avatar.getObjectByName(boneName)[action][axis], limit);
              i++;
            } else {
              ref.animations[0].splice(i, 1);
            }
          }
        }
      }
    } else {
      ref.flag = true;
      setTimeout(() => { ref.flag = false; }, pause);
      ref.animations.shift();
    }
    ref.renderer.render(ref.scene, ref.camera);
  };

  // ── ISL pipeline: accepts plain English string ────────────────────────────
  const signText = (englishStr) => {
    if (!englishStr || typeof englishStr !== 'string') {
      console.warn('[ISL] signText called with invalid string:', englishStr);
      return;
    }
    const str = englishStr.toUpperCase();
    const strWords = str.split(' ').filter(Boolean);
    setText('');
    for (let word of strWords) {
      if (words[word]) {
        ref.animations.push(['add-text', word + ' ']);
        words[word](ref);
      } else {
        for (const [index, ch] of word.split('').entries()) {
          if (index === word.length - 1)
            ref.animations.push(['add-text', ch + ' ']);
          else
            ref.animations.push(['add-text', ch]);
          if (alphabets[ch]) alphabets[ch](ref);
        }
      }
    }
    if (!ref.pending) {
      ref.pending = true;
      ref.animate();
    }
  };

  // ── Sign from text input field ────────────────────────────────────────────
  const signFromInput = () => {
    const val = textFromInput.current ? textFromInput.current.value.trim() : '';
    if (!val) { setStatus('Please enter some text.'); setStatusType('error'); return; }
    setStatus('Signing text input...');
    setStatusType('info');
    setEnglishText(val);
    signText(val);
    setStatus('Animation started.');
    setStatusType('success');
  };

  // ── Helper to format error details ────────────────────────────────────────
  const formatApiError = (errData, defaultMsg) => {
    if (!errData) return defaultMsg;
    if (typeof errData === 'string') return errData;
    if (errData.error) return errData.error;
    if (typeof errData.detail === 'string') return errData.detail;
    if (Array.isArray(errData.detail)) {
      return errData.detail.map(d => d.msg || JSON.stringify(d)).join(', ');
    }
    if (errData.details) return errData.details;
    return defaultMsg;
  };

  // ── Start recording via browser SpeechRecognition ────────────────────────
  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus('Browser speech recognition is unavailable. Please use Chrome or Edge.');
      setStatusType('error');
      return;
    }

    if (isRecordingRef.current) {
      console.warn('[VOICE-STT] SpeechRecognition is already active');
      return;
    }

    // 1. Reset previous recording state
    setStatus('');
    setDetectedLang('');
    setEnglishText('');
    setText('');
    setDebugInfo({});

    const currentLang = selectedLangRef.current || 'hi-IN';
    const recogLang = getSpeechRecognitionLanguage(currentLang);
    const sourceLang = getSourceLanguageCode(currentLang);

    console.log('[VOICE-STT] Selected language:', currentLang);
    console.log('[VOICE-STT] Browser recognition language:', recogLang);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = recogLang;
    recognitionRef.current = recognition;

    recognition.onresult = async (event) => {
      if (!event.results || !event.results[0] || !event.results[0][0]) {
        setStatus('No transcript received from speech recognition.');
        setStatusType('error');
        return;
      }

      const transcript = event.results[0][0].transcript.trim();
      const confidence = event.results[0][0].confidence;

      console.log('[VOICE-STT] Selected language:', currentLang);
      console.log('[VOICE-STT] Browser recognition language:', recogLang);
      console.log('[VOICE-STT] Transcript:', transcript);
      console.log('[VOICE-STT] Source language:', sourceLang);

      if (!transcript) {
        setStatus('No speech recognized. Please speak clearly and try again.');
        setStatusType('error');
        return;
      }

      setDetectedLang(sourceLang);
      setDebugInfo(prev => ({
        ...prev,
        stt: {
          transcript,
          browserLang: recogLang,
          sourceLanguage: sourceLang,
          confidence,
        }
      }));

      setStatus(`Heard (${sourceLang.toUpperCase()}): "${transcript}"`);
      setStatusType('info');

      let finalEnglish = transcript;

      // If source language is not English, translate to English using NLLB
      if (sourceLang !== 'en') {
        setStatus(`Translating from ${sourceLang.toUpperCase()} to English (NLLB-200)…`);
        try {
          console.log('[VOICE-STT] Translation request:', { text: transcript, sourceLanguage: sourceLang });
          const transRes = await fetch(`${API_URL}/api/translate-to-english`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: transcript, sourceLanguage: sourceLang }),
          });
          const transResult = await transRes.json();
          if (!transRes.ok) {
            throw new Error(formatApiError(transResult, `Translation failed (${transRes.status})`));
          }
          console.log('[VOICE-STT] Translation result:', transResult.englishText);
          if (!transResult.englishText || typeof transResult.englishText !== 'string') {
            throw new Error('Translation returned empty text.');
          }
          finalEnglish = transResult.englishText.trim();
          setDebugInfo(prev => ({ ...prev, translation: transResult }));
        } catch (err) {
          console.error('[VOICE-STT] Translation Error:', err);
          setStatus(`Translation failed: ${err.message}`);
          setStatusType('error');
          return;
        }
      } else {
        console.log('[VOICE-STT] Selected language is English, skipping translation.');
      }

      if (!finalEnglish || typeof finalEnglish !== 'string' || !finalEnglish.trim()) {
        setStatus('No valid text to animate.');
        setStatusType('error');
        return;
      }

      console.log('[VOICE-STT] Final English:', finalEnglish);
      console.log('[VOICE-STT] Sending to signText:', finalEnglish);

      setEnglishText(finalEnglish);
      setStatus(`English: "${finalEnglish}" — Starting ISL animations…`);
      setStatusType('success');

      // Send English text to existing ISL animation pipeline
      signText(finalEnglish);
    };

    recognition.onerror = (event) => {
      console.error('[VOICE-STT] Error:', event.error);
      isRecordingRef.current = false;
      setIsRecording(false);

      let msg = `Speech recognition error: ${event.error}`;
      if (event.error === 'not-allowed') {
        msg = 'Microphone permission denied. Please allow microphone access in your browser.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech detected. Please speak into the microphone and try again.';
      } else if (event.error === 'audio-capture') {
        msg = 'No microphone was found or microphone is busy.';
      } else if (event.error === 'network') {
        msg = 'Network error occurred during speech recognition.';
      } else if (event.error === 'aborted') {
        msg = 'Speech recognition was stopped.';
      }
      setStatus(msg);
      setStatusType('error');
    };

    recognition.onend = () => {
      console.log('[VOICE-STT] SpeechRecognition session ended');
      isRecordingRef.current = false;
      setIsRecording(false);
    };

    try {
      recognition.start();
      isRecordingRef.current = true;
      setIsRecording(true);
      console.log('[VOICE-STT] Started listening for language:', recogLang);
      setStatus(`Listening (${sourceLang.toUpperCase()})… Speak now.`);
      setStatusType('info');
    } catch (err) {
      console.error('[VOICE-STT] Failed to start recognition:', err);
      isRecordingRef.current = false;
      setIsRecording(false);
      setStatus(`Failed to start speech recognition: ${err.message}`);
      setStatusType('error');
    }
  };

  // ── Stop recording ────────────────────────────────────────────────────────
  const stopRecording = () => {
    if (recognitionRef.current && isRecordingRef.current) {
      console.log('[VOICE-STT] Manually stopping speech recognition');
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      isRecordingRef.current = false;
      setIsRecording(false);
      setStatus('Processing speech…');
      setStatusType('info');
    }
  };

  // ── Play English translation via Web Speech API (speechSynthesis) ────────
  const playEnglishAudio = () => {
    if (!('speechSynthesis' in window)) {
      setStatus('Speech synthesis is not supported in this browser.');
      setStatusType('error');
      return;
    }

    const textToSpeak = englishText ? englishText.trim() : '';
    if (!textToSpeak) {
      setStatus('No English text to play yet. Speak or enter text first.');
      setStatusType('error');
      return;
    }

    try {
      // Cancel any ongoing speech before starting new utterance
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        console.log('[TTS] Speech started:', textToSpeak);
        setTtsLoading(true);
        setStatus(`Speaking: "${textToSpeak}"`);
        setStatusType('info');
      };

      utterance.onend = () => {
        console.log('[TTS] Speech ended.');
        setTtsLoading(false);
        setStatus('Finished playing English translation.');
        setStatusType('success');
      };

      utterance.onerror = (event) => {
        console.error('[TTS] Error:', event.error);
        setTtsLoading(false);
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          setStatus(`TTS error: ${event.error}`);
          setStatusType('error');
        }
      };

      console.log('[TTS] Speaking English text:', textToSpeak);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('[TTS] Synthesis error:', err);
      setTtsLoading(false);
      setStatus(`Failed to play English speech: ${err.message}`);
      setStatusType('error');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const statusBg = statusType === 'error' ? '#ffe0e0' : statusType === 'success' ? '#e0ffe8' : '#e8f4ff';
  const statusColor = statusType === 'error' ? '#a00' : statusType === 'success' ? '#060' : '#004';
  const isError = statusType === 'error';
  const isSuccess = statusType === 'success';
  const statusIcon = isError ? 'fa-exclamation-circle' : isSuccess ? 'fa-check-circle' : 'fa-info-circle';

  return (
    <div className='container-fluid px-4 py-4 min-vh-100' style={{ background: 'var(--bg-deep)' }}>
      
      {/* Top Status Banner */}
      {status && (
        <div className={`alert ${isError ? 'bg-danger' : isSuccess ? 'bg-success' : 'bg-primary'} shadow-sm border-0 d-flex align-items-center mb-4`} role="alert" style={{ borderRadius: '0.75rem', background: 'rgba(2, 132, 199, 0.2)' }}>
          <i className={`fa ${statusIcon} fs-4 me-3 text-white`}></i>
          <div>
            <h6 className="mb-0 fw-bold text-white">{statusType.toUpperCase()}</h6>
            <span className="small text-white opacity-75">{status}</span>
          </div>
        </div>
      )}

      <div className='row g-4'>
        {/* Left panel: Input & Setup */}
        <div className='col-xl-3 col-lg-4'>
          <div className='workspace-sidebar d-flex flex-column h-100'>
            <div className="d-flex align-items-center mb-4 border-bottom pb-3" style={{ borderColor: 'var(--border-glass) !important' }}>
              <span className="badge rounded-circle p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style={{width: 32, height: 32, background: 'var(--accent-cyan)', color: 'var(--bg-deep)'}}>1</span>
              <h5 className='fw-bold text-white m-0'>Input & Settings</h5>
            </div>
            
            <label className='label-style text-muted mb-2'>Language</label>
            <select
              value={selectedLang}
              onChange={e => setSelectedLang(e.target.value)}
              className='input-style mb-4 fw-semibold text-white'
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>

            <label className='label-style text-muted mb-2'>
              Voice Input
            </label>
            <div className='d-flex flex-column gap-2 mb-4'>
              {isRecording ? (
                <div className="p-3 rounded-3 text-center mb-2" style={{ background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.3)' }}>
                  <div className="spinner-grow spinner-grow-sm text-danger me-2" role="status"></div>
                  <span className="text-danger fw-bold">Recording...</span>
                </div>
              ) : (
                <div className="p-3 rounded-3 text-center mb-2" style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-glass)' }}>
                  <span className="text-muted fw-semibold"><i className="fa fa-microphone-slash me-2"></i>Microphone Idle</span>
                </div>
              )}
              
              <div className='d-flex gap-2'>
                <button className="btn btn-success flex-fill fw-bold shadow-sm" onClick={startRecording} disabled={isRecording}>
                  <i className="fa fa-microphone me-2" /> Start
                </button>
                <button className="btn btn-danger flex-fill fw-bold shadow-sm" onClick={stopRecording} disabled={!isRecording}>
                  <i className="fa fa-stop me-2" /> Stop
                </button>
              </div>
            </div>

            <label className='label-style text-muted mb-2'>Text Input</label>
            <textarea rows={3} ref={textFromInput} placeholder='Type your message here...' className='input-style mb-3' style={{ resize: 'none' }} />
            <button onClick={signFromInput} className='btn btn-primary fw-bold w-100 py-3 mb-4'>
              <i className="fa fa-play me-2"></i> Translate to Sign Language
            </button>

            {/* Debug toggle */}
            <div className="mt-auto pt-3 border-top" style={{ borderColor: 'var(--border-glass) !important' }}>
              <button className="btn btn-sm text-muted w-100 text-start px-0 border-0 shadow-none bg-transparent" onClick={() => setShowDebug(v => !v)}>
                <i className={`fa fa-chevron-${showDebug ? 'up' : 'down'} me-2`}></i> {showDebug ? 'Hide Developer Info' : 'Show Developer Info'}
              </button>
              {showDebug && (
                <pre className="mt-2 p-3 rounded text-muted border" style={{ fontSize: '0.7rem', maxHeight: '150px', overflow: 'auto', background: 'rgba(15, 23, 42, 0.5)', borderColor: 'var(--border-glass)' }}>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Center: 3D Canvas (Result) */}
        <div className='col-xl-6 col-lg-5'>
          <div className='canvas-container w-100 h-100 shadow-lg' id='canvas' style={{ position: 'relative' }}>
            <div className="position-absolute top-0 start-0 m-3 z-index-1">
              <div className="badge shadow-sm px-3 py-2 border" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border-glass)' }}>
                <i className="fa fa-video-camera me-2 text-info"></i> 3D Preview
              </div>
            </div>
            {/* ThreeJS mounts here */}
          </div>
        </div>

        {/* Right panel: Output & Avatar */}
        <div className='col-xl-3 col-lg-3'>
          <div className='workspace-sidebar d-flex flex-column h-100'>
            <div className="d-flex align-items-center mb-4 border-bottom pb-3" style={{ borderColor: 'var(--border-glass) !important' }}>
              <span className="badge rounded-circle p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style={{width: 32, height: 32, background: 'var(--accent-cyan)', color: 'var(--bg-deep)'}}>2</span>
              <h5 className='fw-bold text-white m-0'>Result & Avatar</h5>
            </div>
            
            <label className='label-style text-muted mb-2'>Detected / Processed Text</label>
            <div className="p-3 rounded-3 border mb-4" style={{ background: 'rgba(15, 23, 42, 0.5)', borderColor: 'var(--border-glass)', minHeight: '80px' }}>
              <p className="mb-0 text-white fw-semibold" style={{ minHeight: '40px' }}>
                {text || <span className="text-muted fw-normal fst-italic">Waiting for input...</span>}
              </p>
              {detectedLang && <span className="badge bg-secondary mt-2">Detected: {detectedLang}</span>}
            </div>

            {englishText && englishText !== text && (
              <div className="mb-4">
                <label className='label-style text-muted mb-2'>English Translation</label>
                <div className="p-3 rounded-3 border" style={{ background: 'rgba(15, 23, 42, 0.5)', borderColor: 'rgba(56, 189, 248, 0.5)' }}>
                  <p className="mb-2 text-white">{englishText}</p>
                  <button className="btn btn-sm btn-outline-info w-100 fw-bold" onClick={playEnglishAudio} disabled={ttsLoading}>
                    <i className="fa fa-volume-up me-2" /> {ttsLoading ? 'Playing...' : 'Play Audio'}
                  </button>
                </div>
              </div>
            )}

            <hr className="my-2 opacity-25" />
            
            <label className='label-style mt-2 text-muted mb-2'>Avatar Selection</label>
            <div className="row g-2 mb-4">
              <div className="col-6">
                <img src={xbotPic} className={`bot-image w-100 rounded border ${bot === xbot ? 'border-info shadow-sm opacity-100' : 'border-secondary opacity-50'}`} style={{cursor: 'pointer', transition: 'all 0.3s ease'}} onClick={() => setBot(xbot)} alt='XBOT' title="Select XBOT" />
              </div>
              <div className="col-6">
                <img src={ybotPic} className={`bot-image w-100 rounded border ${bot === ybot ? 'border-info shadow-sm opacity-100' : 'border-secondary opacity-50'}`} style={{cursor: 'pointer', transition: 'all 0.3s ease'}} onClick={() => setBot(ybot)} alt='YBOT' title="Select YBOT" />
              </div>
            </div>
            
            <label className='label-style d-flex justify-content-between text-muted mb-2'>
              <span>Animation Speed</span>
              <span className="fw-bold text-info">{Math.round(speed * 100) / 100}x</span>
            </label>
            <Slider axis="x" xmin={0.05} xmax={0.50} xstep={0.01} x={speed} onChange={({ x }) => setSpeed(x)} className='w-100 mb-4' />
            
            <label className='label-style d-flex justify-content-between text-muted mb-2'>
              <span>Transition Pause</span>
              <span className="fw-bold text-info">{pause}ms</span>
            </label>
            <Slider axis="x" xmin={0} xmax={2000} xstep={100} x={pause} onChange={({ x }) => setPause(x)} className='w-100 mb-2' />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Convert;


