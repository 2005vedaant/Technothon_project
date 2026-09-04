import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function AvatarCanvas({ isSpeaking }) {
  const mountRef = useRef(null);
  const isSpeakingRef = useRef(isSpeaking);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup zoomed in on upper body (Head to Waist framing)
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.01,
      100
    );
    camera.position.set(0, 1.25, 2.5);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(3, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight2.position.set(-4, 3, 4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.position.set(0, 3, 4);
    scene.add(pointLight);

    // 5. Load 3D Avatar Model
    let avatarModel = null;
    let mixer = null;
    let leftArm = null, rightArm = null;
    let leftForeArm = null, rightForeArm = null;
    const morphMeshes = [];

    const setMorph = (name, val) => {
      morphMeshes.forEach((mesh) => {
        const dict = mesh.morphTargetDictionary;
        if (dict && dict[name] !== undefined) {
          const idx = dict[name];
          mesh.morphTargetInfluences[idx] = THREE.MathUtils.clamp(val, 0, 1);
        }
      });
    };

    const loader = new GLTFLoader();

    loader.load(
      '/avatar/model.glb',
      (gltf) => {
        avatarModel = gltf.scene;

        // Auto-center and scale avatar inside view bounding box
        const originalBox = new THREE.Box3().setFromObject(avatarModel);
        const originalSize = new THREE.Vector3();
        originalBox.getSize(originalSize);

        if (originalSize.y > 0) {
          const scale = 4.5 / originalSize.y;
          avatarModel.scale.set(scale, scale, scale);

          const scaledBox = new THREE.Box3().setFromObject(avatarModel);
          const scaledCenter = new THREE.Vector3();
          scaledBox.getCenter(scaledCenter);

          // Position avatar so head is near top and waist is near bottom (matching Reference 2)
          const verticalOffset = 0.05;
          avatarModel.position.x = -scaledCenter.x;
          avatarModel.position.y = verticalOffset - scaledCenter.y;
          avatarModel.position.z = -scaledCenter.z;
        }

        avatarModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.morphTargetDictionary && child.morphTargetInfluences) {
              morphMeshes.push(child);
            }
          }
          if (child.isBone || child.name) {
            if (child.name === 'LeftArm') leftArm = child;
            if (child.name === 'RightArm') rightArm = child;
            if (child.name === 'LeftForeArm') leftForeArm = child;
            if (child.name === 'RightForeArm') rightForeArm = child;
          }
        });

        scene.add(avatarModel);

        // Preserve and play native GLB animations if present
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(avatarModel);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
        }
      },
      undefined,
      (error) => {
        console.error('Error loading avatar model (/avatar/model.glb):', error);
      }
    );

    // 6. Animation Loop & Facial Animation Controller
    let animationFrameId;
    const clock = new THREE.Clock();

    // Natural randomized eye blinking state
    let nextBlinkTime = 2.0;
    let blinkState = { isBlinking: false, startTime: 0, duration: 0.18 };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (mixer) {
        mixer.update(delta);
      }

      // Enforce relaxed standing arm pose: arms hanging straight down beside torso (matching Reference 2)
      if (leftArm) {
        leftArm.rotation.set(1.309, -2.094, -0.262);
      }
      if (rightArm) {
        rightArm.rotation.set(-1.833, -2.094, 2.880);
      }
      if (leftForeArm) {
        leftForeArm.rotation.set(0, 0, 0);
      }
      if (rightForeArm) {
        rightForeArm.rotation.set(0, 0, 0);
      }

      // --- 1. Natural Eye Blinking ---
      if (elapsedTime >= nextBlinkTime) {
        blinkState.isBlinking = true;
        blinkState.startTime = elapsedTime;
        // Next blink randomly in 2.5s to 6.0s
        nextBlinkTime = elapsedTime + 2.5 + Math.random() * 3.5;
      }

      let blinkVal = 0;
      if (blinkState.isBlinking) {
        const progress = (elapsedTime - blinkState.startTime) / blinkState.duration;
        if (progress >= 1.0) {
          blinkState.isBlinking = false;
          blinkVal = 0;
        } else {
          // Smooth sine curve closure and reopening
          blinkVal = Math.sin(progress * Math.PI);
        }
      }
      setMorph('eyeBlinkLeft', blinkVal);
      setMorph('eyeBlinkRight', blinkVal);

      // --- 2. Speech Mouth Movement ---
      if (isSpeakingRef.current) {
        const wave1 = Math.abs(Math.sin(elapsedTime * 9));
        const wave2 = Math.abs(Math.sin(elapsedTime * 13 + 1));
        const wave3 = Math.abs(Math.sin(elapsedTime * 6 + 2));

        const jaw = 0.10 + wave1 * 0.45 + wave2 * 0.15;
        const funnel = wave2 * 0.25;
        const pucker = wave3 * 0.18;
        const smile = 0.05 + wave3 * 0.08;

        setMorph('jawOpen', jaw);
        setMorph('mouthFunnel', funnel);
        setMorph('mouthPucker', pucker);
        setMorph('mouthSmileLeft', smile);
        setMorph('mouthSmileRight', smile);
        setMorph('mouthLowerDownLeft', wave1 * 0.12);
        setMorph('mouthLowerDownRight', wave1 * 0.12);
      } else {
        // Return mouth to neutral closed state
        setMorph('jawOpen', 0);
        setMorph('mouthClose', 0);
        setMorph('mouthFunnel', 0);
        setMorph('mouthPucker', 0);
        setMorph('mouthSmileLeft', 0);
        setMorph('mouthSmileRight', 0);
        setMorph('mouthLowerDownLeft', 0);
        setMorph('mouthLowerDownRight', 0);
        setMorph('mouthUpperUpLeft', 0);
        setMorph('mouthUpperUpRight', 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    // 7. Handle Container Resize
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
  }, []);

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