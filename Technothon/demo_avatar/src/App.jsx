import React, {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Canvas,
  useFrame
} from "@react-three/fiber";

import {
  Environment,
  useGLTF
} from "@react-three/drei";

import * as THREE from "three";

import "./App.css";


/* =========================================================
   FLASK BACKEND
========================================================= */

const API_BASE = "http://127.0.0.1:5000";


/* =========================================================
   HUMAN AVATAR
========================================================= */

function HumanAvatar({ speaking }) {

  const { scene } = useGLTF("/model.glb");

  const avatarRef = useRef(null);

  const morphMeshes = useRef([]);

  const initialized = useRef(false);


  /* =======================================================
     CENTER + SCALE MODEL
  ======================================================= */

  useEffect(() => {

    if (!scene) return;

    if (initialized.current) return;

    initialized.current = true;


    /* -----------------------------------------------------
       GET ORIGINAL MODEL BOUNDING BOX
    ----------------------------------------------------- */

    const originalBox =
      new THREE.Box3().setFromObject(scene);

    const originalSize =
      new THREE.Vector3();

    originalBox.getSize(
      originalSize
    );


    console.log(
      "GLB ORIGINAL SIZE:",
      originalSize
    );


    /* -----------------------------------------------------
       SCALE MODEL
    ----------------------------------------------------- */

    if (originalSize.y > 0) {

      const scale =
        4.5 / originalSize.y;


      scene.scale.set(
        scale,
        scale,
        scale
      );


      /* ---------------------------------------------------
         RECALCULATE BOX AFTER SCALING
      --------------------------------------------------- */

      const scaledBox =
        new THREE.Box3().setFromObject(
          scene
        );

      const scaledCenter =
        new THREE.Vector3();

      scaledBox.getCenter(
        scaledCenter
      );


      /* ---------------------------------------------------
         AVATAR POSITION

         IMPORTANT:
         We position the model AFTER scaling.

         Change ONLY verticalOffset if needed.

         More negative = DOWN
         More positive = UP
      --------------------------------------------------- */

      const verticalOffset = -0.8;


      scene.position.x =
        -scaledCenter.x;

      scene.position.y =
        verticalOffset -
        scaledCenter.y;

      scene.position.z =
        -scaledCenter.z;


      console.log(
        "SCALED CENTER:",
        scaledCenter
      );

      console.log(
        "FINAL AVATAR POSITION:",
        scene.position
      );

    }

  }, [scene]);


  /* =======================================================
     FIND MORPH TARGETS
  ======================================================= */

  useEffect(() => {

    if (!scene) return;


    const meshes = [];


    scene.traverse((object) => {

      if (
        object.isMesh &&
        object.morphTargetDictionary &&
        object.morphTargetInfluences
      ) {

        meshes.push(object);


        console.log(
          "Avatar morph targets:",
          object.name,
          object.morphTargetDictionary
        );

      }

    });


    morphMeshes.current =
      meshes;

  }, [scene]);


  /* =======================================================
     MORPH FUNCTION
  ======================================================= */

  function setMorph(
    name,
    value
  ) {

    morphMeshes.current.forEach(
      (mesh) => {

        const dictionary =
          mesh.morphTargetDictionary;


        if (!dictionary) return;


        if (
          dictionary[name] !== undefined
        ) {

          const index =
            dictionary[name];


          mesh.morphTargetInfluences[index] =
            THREE.MathUtils.clamp(
              value,
              0,
              1
            );

        }

      }
    );

  }


  /* =======================================================
     AVATAR ANIMATION
  ======================================================= */

  useFrame((state) => {

    const time =
      state.clock.getElapsedTime();


    /* =====================================================
       IDLE ROTATION

       IMPORTANT:
       We DON'T change position.y here.
    ===================================================== */

    if (avatarRef.current) {

      avatarRef.current.rotation.y =
        Math.sin(
          time * 0.45
        ) * 0.025;

    }


    /* =====================================================
       BLINKING
    ===================================================== */

    const blinkCycle =
      Math.sin(
        time * 0.7
      );


    let blink = 0;


    if (
      blinkCycle > 0.985
    ) {

      blink =
        (
          blinkCycle -
          0.985
        ) / 0.015;

    }


    setMorph(
      "eyeBlinkLeft",
      blink
    );


    setMorph(
      "eyeBlinkRight",
      blink
    );


    /* =====================================================
       SPEAKING
    ===================================================== */

    if (speaking) {

      const wave1 =
        Math.abs(
          Math.sin(
            time * 9
          )
        );


      const wave2 =
        Math.abs(
          Math.sin(
            time * 13 + 1
          )
        );


      const wave3 =
        Math.abs(
          Math.sin(
            time * 6 + 2
          )
        );


      /* ---------------------------------------------------
         JAW
      --------------------------------------------------- */

      const jaw =
        0.12 +
        wave1 * 0.52 +
        wave2 * 0.18;


      setMorph(
        "jawOpen",
        jaw
      );


      /* ---------------------------------------------------
         MOUTH CLOSE
      --------------------------------------------------- */

      setMorph(
        "mouthClose",
        Math.max(
          0,
          0.45 -
          wave1 * 0.4
        )
      );


      /* ---------------------------------------------------
         MOUTH FUNNEL
      --------------------------------------------------- */

      setMorph(
        "mouthFunnel",
        wave2 * 0.32
      );


      /* ---------------------------------------------------
         MOUTH PUCKER
      --------------------------------------------------- */

      setMorph(
        "mouthPucker",
        wave3 * 0.22
      );


      /* ---------------------------------------------------
         SMILE
      --------------------------------------------------- */

      const smile =
        0.05 +
        wave3 * 0.08;


      setMorph(
        "mouthSmileLeft",
        smile
      );


      setMorph(
        "mouthSmileRight",
        smile
      );


      /* ---------------------------------------------------
         LOWER LIP
      --------------------------------------------------- */

      setMorph(
        "mouthLowerDownLeft",
        wave1 * 0.15
      );


      setMorph(
        "mouthLowerDownRight",
        wave1 * 0.15
      );


      /* ---------------------------------------------------
         UPPER LIP
      --------------------------------------------------- */

      setMorph(
        "mouthUpperUpLeft",
        wave2 * 0.10
      );


      setMorph(
        "mouthUpperUpRight",
        wave2 * 0.10
      );


    } else {

      /* ---------------------------------------------------
         NORMAL FACE
      --------------------------------------------------- */

      setMorph(
        "jawOpen",
        0
      );


      setMorph(
        "mouthClose",
        0
      );


      setMorph(
        "mouthFunnel",
        0
      );


      setMorph(
        "mouthPucker",
        0
      );


      setMorph(
        "mouthSmileLeft",
        0
      );


      setMorph(
        "mouthSmileRight",
        0
      );


      setMorph(
        "mouthLowerDownLeft",
        0
      );


      setMorph(
        "mouthLowerDownRight",
        0
      );


      setMorph(
        "mouthUpperUpLeft",
        0
      );


      setMorph(
        "mouthUpperUpRight",
        0
      );

    }

  });


  /* =======================================================
     RENDER MODEL
  ======================================================= */

  return (

    <primitive
      ref={avatarRef}
      object={scene}
    />

  );

}


useGLTF.preload(
  "/model.glb"
);


/* =========================================================
   AVATAR VIEW
========================================================= */

function AvatarView({
  speaking
}) {

  return (

    <Canvas

      camera={{
        position: [
          0,
          0.8,
          5.5
        ],

        fov: 45,

        near: 0.01,

        far: 100
      }}

      dpr={[
        1,
        2
      ]}

      gl={{
        antialias: true,
        alpha: true
      }}

    >

      {/* =================================================
          LIGHTING
      ================================================= */}

      <ambientLight
        intensity={2}
      />


      <directionalLight
        position={[
          3,
          5,
          5
        ]}
        intensity={2.5}
      />


      <directionalLight
        position={[
          -4,
          3,
          4
        ]}
        intensity={1.5}
      />


      <pointLight
        position={[
          0,
          3,
          4
        ]}
        intensity={1}
      />


      {/* =================================================
          HUMAN AVATAR
      ================================================= */}

      <HumanAvatar
        speaking={
          speaking
        }
      />


      {/* =================================================
          ENVIRONMENT
      ================================================= */}

      <Environment
        preset="studio"
      />

    </Canvas>

  );

}


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  const [
    sentence,
    setSentence
  ] = useState([]);


  const [
    translatedText,
    setTranslatedText
  ] = useState("");


  const [
    targetLanguage,
    setTargetLanguage
  ] = useState("hi");


  const [
    speaking,
    setSpeaking
  ] = useState(false);


  const [
    audioStatus,
    setAudioStatus
  ] = useState("");


  const [
    isGenerating,
    setIsGenerating
  ] = useState(false);


  const [
    lastWord,
    setLastWord
  ] = useState("");


  const [
    cameraError,
    setCameraError
  ] = useState(false);


  /* =======================================================
     FRONTEND WORD TRACKING
  ======================================================= */

  const lastFrontendWord =
    useRef("");


  const lastFrontendTime =
    useRef(0);


  /* =======================================================
     GET WORD FROM FLASK
  ======================================================= */

  const getDetectedWord = async () => {

    try {

      const response =
        await fetch(
          `${API_BASE}/word?t=${Date.now()}`,
          {
            method: "GET",

            cache: "no-store",

            headers: {
              "Cache-Control":
                "no-cache"
            }
          }
        );


      if (!response.ok) {

        console.error(
          "WORD API ERROR:",
          response.status
        );

        return;

      }


      const data =
        await response.json();


      console.log(
        "WORD FROM FLASK:",
        data
      );


      const word =
        String(
          data.word || ""
        ).trim();


      if (!word) {

        return;

      }


      console.log(
        "WORD RECEIVED BY REACT:",
        word
      );


      addWord(word);

    }

    catch (error) {

      console.error(
        "WORD FETCH ERROR:",
        error
      );

    }

  };


  /* =======================================================
     ADD WORD TO SENTENCE
  ======================================================= */

  const addWord = (word) => {

    if (!word) {

      return;

    }


    const now =
      Date.now();


    console.log(
      "ADDING WORD:",
      word
    );


    /* -----------------------------------------------------
       DUPLICATE PROTECTION
    ----------------------------------------------------- */

    if (
      word ===
        lastFrontendWord.current
      &&
      now -
        lastFrontendTime.current <
        1800
    ) {

      console.log(
        "DUPLICATE IGNORED:",
        word
      );

      return;

    }


    lastFrontendWord.current =
      word;

    lastFrontendTime.current =
      now;


    /* -----------------------------------------------------
       FORMAT WORD
    ----------------------------------------------------- */

    let formattedWord =
      word;


    if (
      word ===
      "thank-you"
    ) {

      formattedWord =
        "thank you";

    }


    if (
      word ===
      "don-t want"
    ) {

      formattedWord =
        "don't want";

    }


    if (
      word ===
      "icecream"
    ) {

      formattedWord =
        "ice cream";

    }


    if (
      word ===
      "french fries"
    ) {

      formattedWord =
        "french fries";

    }


    console.log(
      "FINAL WORD:",
      formattedWord
    );


    /* -----------------------------------------------------
       UPDATE LAST WORD
    ----------------------------------------------------- */

    setLastWord(
      formattedWord
    );


    /* -----------------------------------------------------
       ADD TO SENTENCE
    ----------------------------------------------------- */

    setSentence(
      (previousSentence) => {

        const updatedSentence = [
          ...previousSentence,
          formattedWord
        ];


        console.log(
          "UPDATED SENTENCE:",
          updatedSentence
        );


        return updatedSentence;

      }
    );

  };


  /* =======================================================
     POLL FLASK EVERY 300ms
  ======================================================= */

  useEffect(() => {

    console.log(
      "================================="
    );

    console.log(
      "WORD POLLING STARTED"
    );

    console.log(
      "API:",
      `${API_BASE}/word`
    );

    console.log(
      "================================="
    );


    getDetectedWord();


    const interval =
      setInterval(
        () => {

          getDetectedWord();

        },
        300
      );


    return () => {

      clearInterval(
        interval
      );

      console.log(
        "WORD POLLING STOPPED"
      );

    };

  }, []);


  /* =======================================================
     TRANSLATE SENTENCE
  ======================================================= */

  async function translateSentence() {

    if (
      sentence.length === 0
    ) {

      alert(
        "Please create a sentence first."
      );

      return;

    }


    setTranslatedText(
      "Translating..."
    );


    try {

      const response =
        await fetch(
          `${API_BASE}/translate`,
          {

            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                text:
                  sentence.join(" "),

                target:
                  targetLanguage

              })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Translation failed"
        );

      }


      setTranslatedText(
        data.translated_text
      );

    }

    catch (error) {

      console.error(
        "TRANSLATION ERROR:",
        error
      );


      setTranslatedText(
        ""
      );


      alert(
        "Translation error: " +
        error.message
      );

    }

  }


  /* =======================================================
     SPEAK TRANSLATION
  ======================================================= */

  async function speakTranslation() {

    if (
      !translatedText ||
      translatedText ===
        "Translating..."
    ) {

      alert(
        "Please translate the sentence first."
      );

      return;

    }


    if (isGenerating) {

      return;

    }


    try {

      setIsGenerating(
        true
      );


      setAudioStatus(
        "🔊 Generating voice..."
      );


      const response =
        await fetch(
          `${API_BASE}/speak`,
          {

            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                text:
                  translatedText,

                target:
                  targetLanguage

              })

          }
        );


      if (!response.ok) {

        let errorMessage =
          "Voice generation failed.";


        try {

          const data =
            await response.json();


          errorMessage =
            data.error ||
            errorMessage;

        }

        catch (e) {

          console.log(e);

        }


        throw new Error(
          errorMessage
        );

      }


      const audioBlob =
        await response.blob();


      const audioURL =
        URL.createObjectURL(
          audioBlob
        );


      const audio =
        new Audio(
          audioURL
        );


      audio.volume =
        1.0;


      audio.onplay =
        () => {

          setSpeaking(
            true
          );


          setIsGenerating(
            false
          );


          setAudioStatus(
            "🔊 Avatar speaking..."
          );

        };


      audio.onended =
        () => {

          setSpeaking(
            false
          );


          setIsGenerating(
            false
          );


          setAudioStatus(
            ""
          );


          URL.revokeObjectURL(
            audioURL
          );

        };


      audio.onerror =
        () => {

          setSpeaking(
            false
          );


          setIsGenerating(
            false
          );


          setAudioStatus(
            "❌ Audio playback failed"
          );


          URL.revokeObjectURL(
            audioURL
          );

        };


      await audio.play();

    }

    catch (error) {

      console.error(
        "TTS ERROR:",
        error
      );


      setSpeaking(
        false
      );


      setIsGenerating(
        false
      );


      setAudioStatus(
        "❌ Voice generation failed"
      );


      alert(
        "TTS Error:\n" +
        error.message
      );

    }

  }


  /* =======================================================
     DONE
  ======================================================= */

  function doneSentence() {

    setSentence([]);

    setTranslatedText("");

    setAudioStatus("");

    setLastWord("");

    lastFrontendWord.current =
      "";

    lastFrontendTime.current =
      0;

  }


  /* =======================================================
     CAMERA ERROR
  ======================================================= */

  function handleCameraError() {

    setCameraError(
      true
    );

  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="page">

      <div className="container">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="header">

          <h1>
            🤟 Sign Language Translator
          </h1>


          <p>
            Real-time sign language recognition
            and Indian language translation
          </p>

        </header>


        {/* =================================================
            CAMERA + AVATAR
        ================================================= */}

        <div className="visual-area">


          {/* =================================================
              CAMERA
          ================================================= */}

          <div className="camera-container">

            {!cameraError ? (

              <img
                id="cameraFeed"
                src={`${API_BASE}/video`}
                alt="Live Webcam"
                onError={
                  handleCameraError
                }
              />

            ) : (

              <div
                className="camera-error"
              >

                ❌ Camera stream unavailable.

                <br />
                <br />

                Make sure Flask and the
                webcam are running.

              </div>

            )}


            <div className="camera-label">

              📷 LIVE CAMERA • SIGN LANGUAGE DETECTION

            </div>

          </div>


          {/* =================================================
              AVATAR
          ================================================= */}

          <div className="avatar-container">

            <div className="avatar-label">

              🤖 AI TRANSLATOR

            </div>


            <AvatarView
              speaking={
                speaking
              }
            />


            <div
              className={
                `speaking-indicator ${
                  speaking
                    ? "active"
                    : ""
                }`
              }
            >

              🔊 Speaking...

            </div>

          </div>

        </div>


        {/* =================================================
            STATUS
        ================================================= */}

        <div className="status">

          <div className="status-dot"></div>


          <span>
            Sign language detection active
          </span>


          {lastWord && (

            <span
              className="detected-word"
            >

              • Detected:

              <strong>
                {" "}
                {lastWord}
              </strong>

            </span>

          )}

        </div>


        {/* =================================================
            DETECTED SENTENCE
        ================================================= */}

        <div className="section">

          <div className="section-title">

            Detected Sentence

          </div>


          <div className="sentence-box">

            {sentence.length === 0 ? (

              <span className="placeholder">

                Start making signs...

              </span>

            ) : (

              sentence.join(" ")

            )}

          </div>

        </div>


        {/* =================================================
            LANGUAGE
        ================================================= */}

        <div className="section">

          <div className="section-title">

            Translate To

          </div>


          <select
            value={
              targetLanguage
            }

            onChange={
              (event) =>
                setTargetLanguage(
                  event.target.value
                )
            }
          >

            <option value="hi">
              🇮🇳 Hindi
            </option>


            <option value="bn">
              🇮🇳 Bengali
            </option>


            <option value="te">
              🇮🇳 Telugu
            </option>


            <option value="ta">
              🇮🇳 Tamil
            </option>


            <option value="mr">
              🇮🇳 Marathi
            </option>


            <option value="gu">
              🇮🇳 Gujarati
            </option>


            <option value="kn">
              🇮🇳 Kannada
            </option>


            <option value="ml">
              🇮🇳 Malayalam
            </option>


            <option value="pa">
              🇮🇳 Punjabi
            </option>


            <option value="ur">
              🇮🇳 Urdu
            </option>


            <option value="en">
              🇬🇧 English
            </option>

          </select>

        </div>


        {/* =================================================
            TRANSLATED TEXT
        ================================================= */}

        <div className="section">

          <div className="section-title">

            Translated Sentence

          </div>


          <div className="translated-box">

            {translatedText ? (

              translatedText ===
              "Translating..." ? (

                <span className="loading">

                  🌐 Translating...

                </span>

              ) : (

                translatedText

              )

            ) : (

              <span className="placeholder2">

                Translation will appear here...

              </span>

            )}

          </div>


          <div className="audio-status">

            {audioStatus}

          </div>

        </div>


        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="buttons">

          <button
            className="translate-button"
            onClick={
              translateSentence
            }
          >

            🌐 Translate

          </button>


          <button
            className="speak-button"
            onClick={
              speakTranslation
            }

            disabled={
              isGenerating ||
              speaking
            }
          >

            {isGenerating
              ? "⏳ Generating..."
              : speaking
              ? "🔊 Speaking..."
              : "🔊 Speak"}

          </button>


          <button
            className="done-button"
            onClick={
              doneSentence
            }
          >

            ✓ Done

          </button>

        </div>

      </div>

    </div>

  );

}


export default App;