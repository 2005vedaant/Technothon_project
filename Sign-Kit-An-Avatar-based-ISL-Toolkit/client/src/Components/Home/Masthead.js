import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Hero3D from "./Hero3D";
import { WordReveal, FadeUpText } from "./TextAnimator";

function Masthead() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax subtle vertical movement during scroll (disabled when reduced motion preferred)
  const headingY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -35]);
  const descriptionY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -20]);
  const badgeY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -45]);
  const buttonY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -10]);

  return (
    <div ref={containerRef} className="container-fluid d-flex justify-content-center align-items-center pt-5 position-relative" style={{ minHeight: 'calc(100vh - 76px)', overflow: 'hidden', background: 'var(--bg-deep)' }}>
      
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

      <div className="row w-100 position-relative" style={{ maxWidth: "1300px", zIndex: 1, padding: '0 2rem' }}>
        <div className="col-lg-7 text-start">
          
          <motion.div style={{ y: badgeY }}>
            <FadeUpText delay={0.05} duration={0.6} yOffset={18} className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4 glass-panel" style={{ border: '1px solid rgba(0, 240, 255, 0.2)' }} as="div">
              <span className="badge rounded-circle bg-info p-1 me-2" style={{ width: 8, height: 8 }}></span>
              <span className="text-info fw-bold" style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}>POWERED BY AI VISION</span>
            </FadeUpText>
          </motion.div>
          
          <motion.h1 className="fw-bolder mb-4" style={{ y: headingY, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <WordReveal text="Your Digital Ally" className="text-white" as="span" delay={0.1} staggerDuration={0.08} />
            <br />
            <WordReveal text="At Your Fingertips." className="text-gradient" as="span" delay={0.38} staggerDuration={0.08} />
          </motion.h1>
          
          <motion.div style={{ y: descriptionY }}>
            <FadeUpText delay={0.65} duration={0.8} yOffset={25} className="mb-4 lead" style={{ color: '#CBD5E1', fontWeight: 500, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              Translate Sign Language into Text & Speech—and Voice or Text into Signs with AI-powered two-way communication.
            </FadeUpText>
          </motion.div>
          
          <motion.div style={{ y: buttonY }}>
            <FadeUpText delay={0.85} duration={0.6} yOffset={20} className="d-flex gap-4 flex-wrap align-items-center" as="div">
              <a className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill glass-panel text-decoration-none" href="#services">
                Explore Platform
              </a>
            </FadeUpText>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}

export default Masthead;