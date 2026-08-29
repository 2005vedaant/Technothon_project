import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Hero3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    
    // Add subtle fog for depth
    scene.fog = new THREE.FogExp2(0x050816, 0.08);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    mountRef.current.appendChild(renderer.domElement);

    // Group to hold all 3D objects for easy rotation/interaction
    const group = new THREE.Group();
    scene.add(group);

    // 1. Core Glowing Sphere
    const coreGeometry = new THREE.IcosahedronGeometry(1, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00F0FF,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    // 2. Inner Solid Core
    const innerGeo = new THREE.IcosahedronGeometry(0.7, 1);
    const innerMat = new THREE.MeshPhongMaterial({
        color: 0x080B14,
        emissive: 0x050816,
        specular: 0x00F0FF,
        shininess: 100,
        flatShading: true
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerCore);

    // 3. Orbital Rings (Neural pathways)
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x8B5CF6, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.01, 16, 100), ringMat1);
    ring1.rotation.x = Math.PI / 2;
    group.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.015, 16, 100), ringMat2);
    ring2.rotation.y = Math.PI / 3;
    group.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3, 0.005, 16, 100), ringMat1);
    ring3.rotation.x = Math.PI / 4;
    group.add(ring3);

    // 4. Particle Field (Data points)
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 600;
    const posArray = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount * 3; i++) {
        // Generate points in a sphere shell
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particleMat = new THREE.PointsMaterial({
        size: 0.03,
        color: 0x00F0FF,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particleMesh = new THREE.Points(particlesGeo, particleMat);
    group.add(particleMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const cyanLight = new THREE.PointLight(0x00F0FF, 2, 10);
    cyanLight.position.set(2, 2, 2);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x8B5CF6, 2, 10);
    violetLight.position.set(-2, -2, -2);
    scene.add(violetLight);

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (event) => {
        targetX = (event.clientX - windowHalfX) * 0.001;
        targetY = (event.clientY - windowHalfY) * 0.001;
    };
    document.addEventListener('mousemove', handleMouseMove);

    // Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth;
      height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous rotation
      core.rotation.x = elapsedTime * 0.2;
      core.rotation.y = elapsedTime * 0.3;
      
      innerCore.rotation.x = -elapsedTime * 0.1;
      innerCore.rotation.y = -elapsedTime * 0.15;

      ring1.rotation.y = elapsedTime * 0.2;
      ring2.rotation.x = elapsedTime * 0.15;
      ring3.rotation.z = elapsedTime * 0.1;

      particleMesh.rotation.y = elapsedTime * 0.05;
      
      // Floating effect
      group.position.y = Math.sin(elapsedTime * 0.5) * 0.2;

      // Mouse follow with easing (spring effect)
      group.rotation.x += (targetY - group.rotation.x) * 0.05;
      group.rotation.y += (targetX - group.rotation.y) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      const currentMount = mountRef.current;
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      
      // Cleanup geometries and materials
      coreGeometry.dispose(); coreMaterial.dispose();
      innerGeo.dispose(); innerMat.dispose();
      ring1.geometry.dispose(); ringMat1.dispose();
      ring2.geometry.dispose(); ringMat2.dispose();
      ring3.geometry.dispose();
      particlesGeo.dispose(); particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '400px', pointerEvents: 'none' }} />;
};

export default Hero3D;
