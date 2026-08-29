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

function LearnSign() {
  const [bot, setBot] = useState(ybot);
  const [speed, setSpeed] = useState(0.1);
  const [pause, setPause] = useState(800);

  const componentRef = useRef({});
  const { current: ref } = componentRef;

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

    ref.camera = new THREE.PerspectiveCamera(
        30,
        window.innerWidth*0.57 / (window.innerHeight - 70),
        0.1,
        1000
    )

    ref.renderer = new THREE.WebGLRenderer({ antialias: true });
    ref.renderer.setSize(window.innerWidth * 0.57, (window.innerHeight - 70));
    document.getElementById("canvas").innerHTML = "";
    document.getElementById("canvas").appendChild(ref.renderer.domElement);

    ref.camera.position.z = 1.6;
    ref.camera.position.y = 1.4;

    let loader = new GLTFLoader();
    loader.load(
      bot,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ( child.type === 'SkinnedMesh' ) {
            child.frustumCulled = false;
          }
    });
        ref.avatar = gltf.scene;
        ref.scene.add(ref.avatar);
        defaultPose(ref);
      },
      (xhr) => {
        console.log(xhr);
      }
    );

  }, [ref, bot]);

  ref.animate = () => {
    if(ref.animations.length === 0){
        ref.pending = false;
      return ;
    }
    requestAnimationFrame(ref.animate);
    if(ref.animations[0].length){
        if(!ref.flag) {
          for(let i=0;i<ref.animations[0].length;){
            let [boneName, action, axis, limit, sign] = ref.animations[0][i]
            if(sign === "+" && ref.avatar.getObjectByName(boneName)[action][axis] < limit){
                ref.avatar.getObjectByName(boneName)[action][axis] += speed;
                ref.avatar.getObjectByName(boneName)[action][axis] = Math.min(ref.avatar.getObjectByName(boneName)[action][axis], limit);
                i++;
            }
            else if(sign === "-" && ref.avatar.getObjectByName(boneName)[action][axis] > limit){
                ref.avatar.getObjectByName(boneName)[action][axis] -= speed;
                ref.avatar.getObjectByName(boneName)[action][axis] = Math.max(ref.avatar.getObjectByName(boneName)[action][axis], limit);
                i++;
            }
            else{
                ref.animations[0].splice(i, 1);
            }
          }
        }
    }
    else {
      ref.flag = true;
      setTimeout(() => {
        ref.flag = false
      }, pause);
      ref.animations.shift();
    }
    ref.renderer.render(ref.scene, ref.camera);
  }

  let alphaButtons = [];
  for (let i = 0; i < 26; i++) {
    alphaButtons.push(
        <div className='col-md-3' key={`alpha-${i}`}>
            <button className='signs w-100 py-2' onClick={()=>{
              if(ref.animations.length === 0){
                alphabets[String.fromCharCode(i + 65)](ref);
              }
            }}>
                {String.fromCharCode(i + 65)}
            </button>
        </div>
    );
  }

  let wordButtons = [];
  for (let i = 0; i < words.wordList.length; i++) {
    wordButtons.push(
        <div className='col-md-6' key={`word-${i}`}>
            <button className='signs w-100 py-2' onClick={()=>{
              if(ref.animations.length === 0){
                words[words.wordList[i]](ref);
              }
            }}>
                {words.wordList[i]}
            </button>
        </div>
    );
  }

  return (
    <div className='container-fluid px-4 py-4 min-vh-100' style={{ background: 'var(--bg-deep)' }}>
      <div className='row g-4'>
        {/* Left Panel: Library */}
        <div className='col-lg-3 col-md-4'>
          <div className='workspace-sidebar d-flex flex-column h-100'>
            <div className="d-flex align-items-center mb-4 border-bottom pb-3" style={{ borderColor: 'var(--border-glass) !important' }}>
              <span className="badge rounded-circle p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style={{width: 32, height: 32, background: 'var(--accent-cyan)', color: 'var(--bg-deep)'}}>1</span>
              <h5 className='fw-bold text-white m-0'>Library</h5>
            </div>
            
            <h6 className='fw-bold text-muted mb-3 mt-2 text-uppercase' style={{ letterSpacing: '0.05em', fontSize: '0.85rem' }}>Alphabets</h6>
            <div className='row g-2 mb-4'>
                {alphaButtons}
            </div>
            
            <hr className="my-3 opacity-25" style={{ borderColor: 'var(--border-glass)' }} />
            
            <h6 className='fw-bold text-muted mb-3 text-uppercase' style={{ letterSpacing: '0.05em', fontSize: '0.85rem' }}>Words</h6>
            <div className='row g-2 overflow-auto custom-scrollbar pe-2' style={{ maxHeight: '40vh' }}>
                {wordButtons}
            </div>
          </div>
        </div>
        
        {/* Center: 3D Canvas (Result) */}
        <div className='col-lg-6 col-md-5'>
          <div className='canvas-container w-100 h-100 shadow-lg' id='canvas' style={{ position: 'relative' }}>
            <div className="position-absolute top-0 start-0 m-3 z-index-1">
              <div className="badge shadow-sm px-3 py-2 border" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border-glass)' }}>
                <i className="fa fa-graduation-cap me-2 text-info"></i> Learning Environment
              </div>
            </div>
            {/* ThreeJS mounts here */}
          </div>
        </div>
        
        {/* Right Panel: Settings */}
        <div className='col-lg-3 col-md-3'>
          <div className='workspace-sidebar d-flex flex-column h-100'>
            <div className="d-flex align-items-center mb-4 border-bottom pb-3" style={{ borderColor: 'var(--border-glass) !important' }}>
              <span className="badge rounded-circle p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style={{width: 32, height: 32, background: 'var(--accent-cyan)', color: 'var(--bg-deep)'}}>2</span>
              <h5 className='fw-bold text-white m-0'>Settings</h5>
            </div>
            
            <label className='label-style text-muted mb-2'>Avatar Selection</label>
            <div className="row g-2 mb-4">
              <div className="col-6">
                <img src={xbotPic} className={`bot-image w-100 rounded border ${bot === xbot ? 'border-info shadow-sm opacity-100' : 'border-secondary opacity-50'}`} style={{cursor: 'pointer', transition: 'all 0.3s ease'}} onClick={() => setBot(xbot)} alt='XBOT' title="Select XBOT" />
              </div>
              <div className="col-6">
                <img src={ybotPic} className={`bot-image w-100 rounded border ${bot === ybot ? 'border-info shadow-sm opacity-100' : 'border-secondary opacity-50'}`} style={{cursor: 'pointer', transition: 'all 0.3s ease'}} onClick={() => setBot(ybot)} alt='YBOT' title="Select YBOT" />
              </div>
            </div>
            
            <label className='label-style d-flex justify-content-between text-muted mb-2 mt-2'>
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
  )
}

export default LearnSign;
