import React from "react";
import { Link } from "react-router-dom";
import Hero3D from "./Hero3D";

function Masthead() {
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center pt-5 position-relative" style={{ minHeight: 'calc(100vh - 76px)', overflow: 'hidden', background: 'var(--bg-deep)' }}>
      
      {/* Premium Ambient Lighting */}
      <div className="ambient-bg">
        <div className="ambient-glow-1"></div>
        <div className="ambient-glow-2"></div>
      </div>

      {/* 3D Visual Centerpiece */}
      <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ top: 0, zIndex: 0, opacity: 0.8 }}>
        <div className="w-100 h-100 d-none d-lg-block position-absolute" style={{ right: '-15%' }}>
            <Hero3D />
        </div>
        <div className="w-100 h-100 d-block d-lg-none position-absolute opacity-50">
            <Hero3D />
        </div>
      </div>

      <div className="row w-100 position-relative fade-in-up" style={{ maxWidth: "1300px", zIndex: 1, padding: '0 2rem' }}>
        <div className="col-lg-7 text-start">
          
          <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4 glass-panel" style={{ border: '1px solid rgba(0, 240, 255, 0.2)' }}>
            <span className="badge rounded-circle bg-info p-1 me-2" style={{ width: 8, height: 8 }}></span>
            <span className="text-info fw-bold" style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}>POWERED BY AI VISION</span>
          </div>
          
          <h1 className="fw-bolder mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <span className="text-white">Your Digital Ally</span><br />
            <span className="text-gradient">At Your Fingertips.</span>
          </h1>
          
          <p className="mb-4 lead" style={{ color: '#CBD5E1', fontWeight: 500, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            Translate Sign Language into Text & Speech—and Voice or Text into Signs with AI-powered two-way communication.
          </p>
          
          <div className="d-flex gap-4 flex-wrap align-items-center">
            <a className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill glass-panel text-decoration-none" href="#services">
              Explore Platform
            </a>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Masthead;