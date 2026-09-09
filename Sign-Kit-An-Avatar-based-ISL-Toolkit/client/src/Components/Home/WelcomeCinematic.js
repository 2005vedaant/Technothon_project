// src/Components/Home/WelcomeCinematic.js
import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useReducedMotion } from 'framer-motion';

// Frames are stored in the public folder under /animation-frames
const FRAME_COUNT = 300;
const FRAMES_PATH = '/animation-frames';

export default function WelcomeCinematic({ username, scrollYProgress }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();

  // Scroll spring for smooth progression
  const spring = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // ==========================================
  // PHASE 1 & 2: WELCOME OVERLAY MOTION VALUES
  // ==========================================
  // Progress 0.00 -> 0.05: Welcome fully visible (Opacity = 1, Scale = 1)
  // Progress 0.05 -> 0.20: Welcome fades out (Opacity = 1 -> 0, Scale = 1 -> 0.85)
  const welcomeOpacity = useTransform(spring, [0, 0.05, 0.20], [1, 1, 0]);
  const welcomeScale = useTransform(spring, [0, 0.05, 0.20], [1, 1, 0.85]);
  const rotateYVal = useTransform(spring, [0, 0.20], [0, -15]);
  const translateZVal = useTransform(spring, [0, 0.20], [0, -30]);
  const indicatorOpacityVal = useTransform(spring, [0, 0.10], [1, 0]);
  const indicatorYVal = useTransform(spring, [0, 0.10], [0, -10]);
  const taglineYVal = useTransform(spring, [0, 0.20], [0, -15]);

  // ==========================================
  // PHASE 2, 3 & 4: CANVAS ANIMATION MOTION VALUES
  // ==========================================
  // Progress 0.08 -> 0.20: Animation fades in (Opacity = 0 -> 1)
  // Progress 0.20 -> 0.88: Animation opacity = 1
  // Progress 0.88 -> 0.98: Animation fades out & scales slightly (Opacity = 1 -> 0, Scale = 1 -> 0.9)
  // Progress 0.98 -> 1.00: Animation opacity = 0 (completely gone before sticky container releases)
  const animationOpacity = useTransform(
    spring,
    [0.08, 0.20, 0.88, 0.98],
    [0, 1, 1, 0]
  );
  const animationScale = useTransform(spring, [0.88, 0.98], [1, 0.9]);

  // Frame progress mapping:
  // Progress 0.00 -> 0.20: Frame 0 (frame 1)
  // Progress 0.20 -> 0.85: Advance linearly from Frame 0 to Frame 299
  // Progress 0.85 -> 1.00: Frame 299 (frame 300 remains visible while fading out)
  const frameIdx = useTransform(spring, [0.20, 0.85], [0, FRAME_COUNT - 1]);

  const renderUserName = () => {
    const nameToRender = username && username.length > 0 ? username : '...';
    return nameToRender.split('').map((char, i) => (
      <span key={i} className="vedaant-char">
        {char}
      </span>
    ));
  };

  // Pre-load images
  const [images, setImages] = useState(new Array(FRAME_COUNT));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadFrame = (index) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = `${FRAMES_PATH}/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;
      img.onload = () => {
        if (!cancelled) {
          setImages(prev => {
            const copy = [...prev];
            copy[index] = img;
            return copy;
          });
        }
      };
    };

    const load = async () => {
      const initial = Math.min(10, FRAME_COUNT);
      const loaded = [];
      for (let i = 0; i < initial; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.src = `${FRAMES_PATH}/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;
        await new Promise(res => {
          img.onload = res;
          img.onerror = res;
        });
        loaded[i] = img;
      }
      if (!cancelled) {
        setImages(prev => {
          const copy = [...prev];
          for (let i = 0; i < loaded.length; i++) copy[i] = loaded[i];
          return copy;
        });
        setReady(true);
      }
      for (let i = initial; i < FRAME_COUNT; i++) {
        loadFrame(i);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Canvas cover drawing
  useEffect(() => {
    if (!ready || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const draw = () => {
      const rawIdx = Math.round(frameIdx.get());
      const idx = Math.max(0, Math.min(FRAME_COUNT - 1, rawIdx));
      const img = images[idx];
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;

      const targetWidth = Math.round(w * dpr);
      const targetHeight = Math.round(h * dpr);

      // Resize canvas buffer and CSS dimensions if needed
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }

      // Apply DPR scaling to context
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Enable high quality image smoothing
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) {
        ctx.imageSmoothingQuality = 'high';
      }

      ctx.clearRect(0, 0, w, h);

      if (img && img.complete && img.width > 0 && img.height > 0) {
        const scale = Math.max(w / img.width, h / img.height);
        const renderedWidth = img.width * scale;
        const renderedHeight = img.height * scale;
        const x = (w - renderedWidth) / 2;
        const y = (h - renderedHeight) / 2;
        ctx.drawImage(img, x, y, renderedWidth, renderedHeight);
      }
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [images, ready, frameIdx, reducedMotion]);

  // Resize handling
  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Loading overlay
  if (!ready) {
    return (
      <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
        <p style={{ color: '#fff', letterSpacing: '0.1em' }}>INITIALIZING MITRA AI…</p>
      </section>
    );
  }

  // Reduced-motion fallback
  if (reducedMotion) {
    return (
      <section style={{ height: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="welcome-overlay" style={{ textAlign: 'center', color: '#fff' }}>
          <h3 className="welcome-subtitle">Welcome,</h3>
          <h1 className="welcome-title">{renderUserName()}</h1>
          <p className="welcome-tagline">Let’s make communication more inclusive</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="combined-cinematic-section"
      style={{
        height: `${FRAME_COUNT * 1.2}vh`,
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        className="sticky-cinematic-viewport"
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--bg-deep)',
        }}
      >
        {/* Welcome overlay */}
        <div
          className="welcome-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 2,
            width: '100%',
            height: '100%',
          }}
        >
          <motion.h3
            className="welcome-subtitle"
            style={{
              opacity: welcomeOpacity,
              scale: welcomeScale,
              rotateY: rotateYVal,
              translateZ: translateZVal,
            }}
          >
            Welcome,
          </motion.h3>
          <motion.h1
            className="welcome-title"
            style={{
              opacity: welcomeOpacity,
              scale: welcomeScale,
              rotateY: rotateYVal,
              translateZ: translateZVal,
              perspective: 1200,
            }}
          >
            {renderUserName()}
          </motion.h1>
          <motion.p className="welcome-tagline" style={{ opacity: welcomeOpacity, y: taglineYVal }}>
            Let’s make communication more inclusive
          </motion.p>
          <motion.div className="scroll-indicator" style={{ opacity: indicatorOpacityVal, y: indicatorYVal }}>
            ↓ SCROLL
          </motion.div>
        </div>

        {/* Canvas animation with opacity and scale exit transition */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: animationOpacity,
            scale: animationScale,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'block',
              background: 'var(--bg-deep)',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

