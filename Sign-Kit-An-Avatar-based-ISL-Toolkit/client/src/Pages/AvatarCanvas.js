import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function AvatarCanvas({ isSpeaking }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080d1a');

    // 2. Camera setup focused on upper torso and head
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.4, 1.8);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(2, 4, 3);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x00f0ff, 1.0);
    fillLight.position.set(-2, 2, 1);
    scene.add(fillLight);

    // 5. Load Human 3D Avatar Model
    let avatarModel = null;
    let headNode = null;
    const loader = new GLTFLoader();

    loader.load(
      '/human.glb',
      (gltf) => {
        avatarModel = gltf.scene;
        avatarModel.position.set(0, -0.6, 0);
        avatarModel.scale.set(1.1, 1.1, 1.1);
        
        // Find head or face mesh for subtle animation
        avatarModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
          if (child.name.toLowerCase().includes('head')) {
            headNode = child;
          }
        });

        scene.add(avatarModel);
      },
      undefined,
      (error) => {
        console.warn('Fallback: human.glb not found in public folder yet.', error);
      }
    );

    // 6. Animation Loop (Breathing, Hearing & Lip Sync Motion)
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (avatarModel) {
        // Natural subtle breathing motion
        avatarModel.position.y = -0.6 + Math.sin(elapsedTime * 2) * 0.01;

        // Subtle head tilt simulating listening/understanding
        avatarModel.rotation.y = Math.sin(elapsedTime * 0.8) * 0.05;

        // Simulate speaking mouth/head movement when active
        if (isSpeaking && headNode) {
          headNode.rotation.x = Math.sin(elapsedTime * 15) * 0.03;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isSpeaking]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '260px', 
        borderRadius: '12px', 
        overflow: 'hidden',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        background: 'rgba(5, 8, 17, 0.9)'
      }} 
    />
  );
}