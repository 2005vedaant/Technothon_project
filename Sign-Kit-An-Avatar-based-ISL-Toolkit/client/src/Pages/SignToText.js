import React, { useState, useEffect, useRef } from "react";
import { TECHNOTHON_API, pollTechnothonWord, clearTechnothonQueue, technothonSpeak } from "../services/api";

function SignToText() {
    const [sentence, setSentence] = useState("");
    const [isPolling, setIsPolling] = useState(false);
    const [status, setStatus] = useState("Idle");
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // Auto-polling effect
    useEffect(() => {
        let interval;
        if (isPolling) {
            interval = setInterval(async () => {
                try {
                    const data = await pollTechnothonWord();
                    if (data.word) {
                        setSentence(prev => prev ? `${prev} ${data.word}` : data.word);
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                    setStatus("Connection error to AI Engine");
                }
            }, 1000); // Poll every second
        }
        return () => clearInterval(interval);
    }, [isPolling]);

    const handleStart = () => {
        setIsPolling(true);
        setStatus("Translating ISL Camera Feed...");
    };

    const handleStop = () => {
        setIsPolling(false);
        setStatus("Translation Paused");
    };

    const handleClear = async () => {
        try {
            await clearTechnothonQueue();
            setSentence("");
            setStatus("Queue Cleared");
        } catch (error) {
            console.error("Clear error:", error);
        }
    };

    const handleSpeak = async () => {
        if (!sentence) return;
        try {
            setIsSpeaking(true);
            setStatus("Speaking...");
            const audioBlob = await technothonSpeak(sentence, 'en');
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.onended = () => {
                setIsSpeaking(false);
                setStatus(isPolling ? "Translating ISL Camera Feed..." : "Translation Paused");
            };
            audio.play();
        } catch (error) {
            console.error("TTS error:", error);
            setIsSpeaking(false);
            setStatus("Speech synthesis failed");
        }
    };

    return (
        <div className="container-fluid px-4 py-4 min-vh-100" style={{ background: 'var(--bg-deep)' }}>
            
            <div className="row mb-4">
                <div className="col-12 text-center">
                    <h2 className="fw-bold text-white mb-2">ISL Camera Translator</h2>
                    <p className="text-muted">Perform sign language in front of the camera and watch real-time translation.</p>
                </div>
            </div>

            <div className="row g-4 justify-content-center">
                {/* Left Panel: Camera Feed */}
                <div className="col-xl-7 col-lg-8">
                    <div className="glass-panel overflow-hidden h-100 position-relative shadow-lg" style={{ border: '1px solid var(--accent-cyan)' }}>
                        <div className="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between align-items-center z-index-1" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                            <div className="badge shadow-sm px-3 py-2 border" style={{ background: 'rgba(5, 8, 22, 0.8)', color: 'var(--accent-cyan)', borderColor: 'var(--border-glass)' }}>
                                <i className="fa fa-video-camera me-2 text-info"></i> AI Vision Feed
                            </div>
                            <div className="d-flex align-items-center">
                                <span className={`badge rounded-pill ${isPolling ? 'bg-success' : 'bg-danger'} me-2`} style={{ width: 10, height: 10, padding: 0 }}></span>
                                <span className="text-white fw-bold small">{isPolling ? "LIVE INFERENCE" : "OFFLINE"}</span>
                            </div>
                        </div>
                        
                        {/* Video Stream from Technothon Backend */}
                        <div className="w-100 d-flex justify-content-center bg-black h-100 align-items-center" style={{ minHeight: '500px' }}>
                            <img 
                                src={`${TECHNOTHON_API}/video`} 
                                alt="Live ISL AI Feed" 
                                className="img-fluid w-100 h-100 object-fit-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="text-center text-muted"><i class="fa fa-exclamation-triangle fa-3x mb-3 text-warning"></i><h5>Camera Stream Offline</h5><p>Ensure the AI backend is running on port 8080.</p></div>';
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Transcription & Controls */}
                <div className="col-xl-4 col-lg-4">
                    <div className="workspace-sidebar d-flex flex-column h-100">
                        
                        <div className="d-flex align-items-center mb-4 border-bottom pb-3" style={{ borderColor: 'var(--border-glass) !important' }}>
                            <i className="fa fa-commenting text-info fs-4 me-3" style={{ textShadow: 'var(--glow-cyan)' }}></i>
                            <h5 className="fw-bold text-white m-0">Live Transcription</h5>
                        </div>

                        {/* Status Message */}
                        <div className={`alert ${status.includes('error') || status.includes('failed') ? 'bg-danger' : 'bg-primary'} bg-opacity-25 border-0 shadow-sm mb-4`} style={{ borderRadius: '0.75rem', color: 'var(--text-main)' }}>
                            <i className={`fa ${status.includes('error') ? 'fa-warning' : 'fa-info-circle'} me-2`}></i>
                            {status}
                        </div>
                        
                        <label className="label-style text-muted mb-2">Detected Sentence</label>
                        <div className="p-4 rounded-3 border flex-grow-1 mb-4 position-relative overflow-auto custom-scrollbar" style={{ background: 'rgba(15, 23, 42, 0.5)', borderColor: 'var(--border-glass)', minHeight: '150px' }}>
                            {sentence ? (
                                <p className="fs-5 text-white lh-base m-0 fw-semibold">{sentence}</p>
                            ) : (
                                <p className="text-muted fst-italic position-absolute top-50 start-50 translate-middle w-100 text-center m-0">
                                    Waiting for gestures...
                                </p>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="mt-auto pt-3 border-top" style={{ borderColor: 'var(--border-glass) !important' }}>
                            <div className="d-flex gap-2 mb-3">
                                {!isPolling ? (
                                    <button className="btn btn-success flex-fill fw-bold py-3 shadow-sm" onClick={handleStart}>
                                        <i className="fa fa-play me-2"></i> Start Translating
                                    </button>
                                ) : (
                                    <button className="btn btn-danger flex-fill fw-bold py-3 shadow-sm" onClick={handleStop}>
                                        <i className="fa fa-pause me-2"></i> Pause
                                    </button>
                                )}
                            </div>

                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-info flex-fill fw-bold" onClick={handleSpeak} disabled={!sentence || isSpeaking}>
                                    <i className={`fa ${isSpeaking ? 'fa-spinner fa-spin' : 'fa-volume-up'} me-2`}></i> Speak
                                </button>
                                <button className="btn btn-outline-danger flex-fill fw-bold" onClick={handleClear} disabled={!sentence}>
                                    <i className="fa fa-trash me-2"></i> Clear
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignToText;
