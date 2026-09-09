// src/Components/Home/Welcome.js
import React, { useRef } from 'react';
import { motion, useTransform, useSpring, useReducedMotion } from 'framer-motion';
// No need to import useAuth here; username will be passed as a prop


export default function Welcome({ username, scrollYProgress }) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const containerRef = useRef(null);

  // Unconditional motion values
  const opacityVal = useTransform(spring, [0, 0.2, 1], [0, 1, 1]);
  const scaleVal = useTransform(spring, [0, 0.2, 0.6, 1], [0.8, 0.95, 1, 1]);
  const rotateYVal = useTransform(spring, [0.6, 1], [-30, 0]);
  const translateZVal = useTransform(spring, [0, 0.6, 1], [30, 0, -20]);
  const indicatorOpacityVal = useTransform(spring, [0, 0.1, 0.2], [1, 0, 0]);
  const taglineYVal = useTransform(spring, [0, 1], [30, 0]);
  const indicatorYVal = useTransform(spring, [0, 0.2], [0, -10]);

  // Values respecting reduced motion
  const opacity = reduceMotion ? 1 : opacityVal;
  const scale = reduceMotion ? 1 : scaleVal;
  const rotateY = reduceMotion ? 0 : rotateYVal;
  const translateZ = reduceMotion ? 0 : translateZVal;
  const indicatorOpacity = reduceMotion ? 0 : indicatorOpacityVal;
  const taglineY = reduceMotion ? 0 : taglineYVal;
  const indicatorY = reduceMotion ? 0 : indicatorYVal;


  // Accept username as prop; show loading placeholder if empty
  // Component signature receives { username }
  const renderUserName = () => {
    const nameToRender = username && username.length > 0 ? username : '...';
    return nameToRender.split('').map((char, i) => (
      <span key={i} className="vedaant-char">
        {char}
      </span>
    ));
  };


  return (
    <section className="welcome-section" ref={containerRef}>
      <div className="welcome-bg" />
      <div className="welcome-content">
        <motion.h3 className="welcome-subtitle" style={{ opacity, scale, rotateY, translateZ }}>
          Welcome,
        </motion.h3>
        <motion.h1 className="welcome-title" style={{ opacity, scale, rotateY, translateZ, perspective: 1200 }}>
          {renderUserName()}
        </motion.h1>
        <motion.p className="welcome-tagline" style={{ opacity, y: taglineY }}>
          Let’s make communication more inclusive
        </motion.p>
      </div>
      <motion.div className="scroll-indicator" style={{ opacity: indicatorOpacity, y: indicatorY }}>
        ↓ SCROLL
      </motion.div>
    </section>
  );
}
