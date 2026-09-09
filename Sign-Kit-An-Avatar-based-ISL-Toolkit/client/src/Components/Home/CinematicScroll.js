
import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion';

// Frames are stored in the public folder under /animation-frames

// The project contains 300 JPG frames (ezgif-frame-001.jpg … ezgif-frame-300.jpg)
const FRAME_COUNT = 300;
const FRAMES_PATH = '/animation-frames';

export default function CinematicScroll({ scrollYProgress }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [images, setImages] = useState(new Array(FRAME_COUNT)); // pre‑allocate array
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();

  // Use the scrollYProgress passed via props for synchronization
  const spring = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const frameIdx = useTransform(spring, [0, 1], [0, FRAME_COUNT - 1]);

  // ---------------------------------------------------------------------------
  // Pre‑load images – load first few synchronously, the rest lazily
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const initial = Math.min(10, FRAME_COUNT);
      const loaded = [];
      // Load the first `initial` frames sequentially so the first frame appears quickly
      for (let i = 1; i <= initial; i++) {
        const img = new Image();
        img.src = `${FRAMES_PATH}/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
        await new Promise((res) => {
          img.onload = res;
          img.onerror = res;
        });
        loaded[i - 1] = img;
      }
      if (!cancelled) {
        setImages((prev) => {
          const copy = [...prev];
          for (let i = 0; i < loaded.length; i++) copy[i] = loaded[i];
          return copy;
        });
        setReady(true);
      }
      // Load the remaining frames in the background (fire‑and‑forget)
      for (let i = initial + 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `${FRAMES_PATH}/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
        img.onload = () => {
          if (!cancelled) {
            setImages((prev) => {
              const copy = [...prev];
              copy[i - 1] = img;
              return copy;
            });
          }
        };
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ---------------------------------------------------------------------------
  // Draw the current frame on the canvas – runs on every animation frame
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!ready || reducedMotion) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const draw = () => {
      const idx = Math.floor(frameIdx.get());
      const img = images[idx];
      if (img) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        // Preserve aspect ratio
        const ratio = Math.min(w / img.width, h / img.height);
        const drawW = img.width * ratio;
        const drawH = img.height * ratio;
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH);
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [images, ready, frameIdx, reducedMotion]);

  // Resize handling – keep canvas full‑screen
  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  // While the first frames are loading, show a minimal overlay
  if (!ready) {
    return (
      <section
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <p style={{ color: '#fff' }}>INITIALIZING MITRA AI…</p>
      </section>
    );
  }

  // If the user prefers reduced motion, skip the canvas animation and show a static placeholder
  if (reducedMotion) {
    return (
      <section
        style={{
          height: `${FRAME_COUNT * 0.5}vh`,
          background: '#000',
        }}
      />
    );
  }

  // Normal animated canvas
  return (
    <section ref={containerRef} style={{ height: `${FRAME_COUNT * 0.5}vh`, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          background: '#000',
        }}
      />
    </section>
  );

  

}
