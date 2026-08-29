import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { Form, Button } from "react-bootstrap";
import { baseURL } from "../Config/config";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "font-awesome/css/font-awesome.min.css";
import axios from "axios";
import ConfirmModal from "../Components/CreateVideo/ConfirmModal";

function CreateVideo() {
  const [video, setVideo] = useState({
    title: "",
    desc: "",
    createdBy: "",
    type: "PUBLIC"
  });
  const [validated, setValidated] = useState(false);
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState("");
  const [videoId, setVideoId] = useState("")
  const [showModal, setShowModal] = useState(false)
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const navigate = useNavigate()

  const handleInputChanges = (event) => {
    setVideo((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const validateVideo = () => {
    if (!video.title || !video.desc || !video.createdBy) return false;
    else if (mode === "text" && !text) return false;
    else if (mode === "file" && !file) return false;
    else if (mode === "speech" && !transcript) return false;
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateVideo() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    let content = "";
    if (mode === "text") content = text;
    else if (mode === "file") content = await file.text();
    else if (mode === "speech") content = transcript;

    const newVideo = {
      ...video,
      content: content,
    };

    axios
      .post(`${baseURL}/videos/create-video`, newVideo)
      .then((res) => {
        setVideoId(res.data.videoId)
        setShowModal(true)
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="container-fluid d-flex flex-column align-items-center px-0 min-vh-100 pb-5">
      <div className="container-fluid text-white py-5 mb-5 position-relative overflow-hidden" style={{ background: '#020617' }}>
        <div className="position-absolute rounded-circle opacity-10 blur-3xl" style={{ background: '#06B6D4', width: '300px', height: '300px', top: '-50%', right: '10%', filter: 'blur(80px)' }}></div>
        <div className="container my-4 text-center position-relative z-index-1 fade-in-up">
          <h1 className="display-4 fw-bold mb-3">Create a New Video</h1>
          <p className="lead mx-auto text-muted" style={{ maxWidth: '800px' }}>
            Provide your content below to generate a new Indian Sign Language translation video in seconds.
          </p>
        </div>
      </div>

      <div className="container fade-in-up" style={{ maxWidth: '900px', animationDelay: '0.1s' }}>
        <div className="card-background p-4 p-md-5">
          <Form
            noValidate
            validated={validated}
            onSubmit={handleSubmit}
          >
            <div className="row g-4">
              <div className="col-12 mb-2">
                  <h4 className="fw-bold text-white mb-0 border-bottom border-secondary pb-3">1. Video Details</h4>
              </div>
              <Form.Group controlId="title" className="col-12">
                <Form.Label className="label-style m-0 mb-2">Video Title</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="e.g. Introduction to Machine Learning"
                  value={video.title}
                  name="title"
                  className="input-style"
                  onChange={handleInputChanges}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a title.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="desc" className="col-12">
                <Form.Label className="label-style m-0 mb-2">Description</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Briefly describe what this video is about..."
                  name="desc"
                  onChange={handleInputChanges}
                  as="textarea"
                  rows={3}
                  className="input-style"
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a description.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="createdBy" className="col-md-6">
                <Form.Label className="label-style m-0 mb-2">Creator Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Your Name"
                  name="createdBy"
                  className="input-style"
                  onChange={handleInputChanges}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter your name.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="type" className="col-md-6">
                <Form.Label className="label-style m-0 mb-2">Visibility</Form.Label>
                <Form.Select
                  required
                  value={video.type}
                  name="type"
                  className="input-style cursor-pointer"
                  onChange={handleInputChanges}
                >
                  <option value="PUBLIC">Public — Visible in the community feed</option>
                  <option value="PRIVATE">Private — Unlisted, accessible via Video ID only</option>
                </Form.Select>
              </Form.Group>

              <div className="col-12 mt-5 mb-2">
                  <h4 className="fw-bold text-white mb-0 border-bottom border-secondary pb-3">2. Content Source</h4>
              </div>

              <Form.Group controlId="mode" className="col-12">
                <Form.Label className="label-style m-0 mb-2">Select Input Mode</Form.Label>
                <div className="d-flex flex-wrap gap-3 mb-4">
                    {['text', 'speech', 'file'].map((m) => (
                        <div 
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-fill text-center p-3 rounded-3 border cursor-pointer transition-all ${mode === m ? 'border-info bg-info bg-opacity-10 text-info shadow-sm' : 'border-secondary text-muted hover-bg-light'}`}
                            style={{ cursor: 'pointer', background: 'rgba(15, 23, 42, 0.4)' }}
                        >
                            <i className={`fa fa-${m === 'text' ? 'keyboard-o' : m === 'speech' ? 'microphone' : 'file-text-o'} fs-4 mb-2 d-block`}></i>
                            <span className="fw-semibold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>{m}</span>
                        </div>
                    ))}
                </div>
              </Form.Group>

              {mode === "text" && (
                <Form.Group controlId="text" className="col-12 fade-in-up" style={{ animationDuration: '0.3s' }}>
                  <Form.Label className="label-style m-0 mb-2">Enter Content</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Type the exact English text to be translated..."
                    name="content"
                    onChange={(e) => setText(e.target.value)}
                    as="textarea"
                    rows={6}
                    className="input-style"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide text content.
                  </Form.Control.Feedback>
                </Form.Group>
              )}

              {mode === "file" && (
                <Form.Group controlId="formFile" className="col-12 fade-in-up" style={{ animationDuration: '0.3s' }}>
                  <Form.Label className="label-style m-0 mb-2">Upload Text File (.txt)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".txt"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                    className="input-style"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please upload a text file.
                  </Form.Control.Feedback>
                </Form.Group>
              )}

              {mode === "speech" && (
                <div className="col-12 fade-in-up" style={{ animationDuration: '0.3s' }}>
                  <div className="p-4 rounded-4 border border-secondary mb-4" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                      <div className="d-flex align-items-center bg-dark px-3 py-2 rounded-pill border border-secondary shadow-sm">
                        <div className={`spinner-grow spinner-grow-sm me-2 ${listening ? 'text-danger' : 'text-secondary'}`} role="status"></div>
                        <span className={`fw-bold text-uppercase ${listening ? 'text-danger' : 'text-secondary'}`} style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                            {listening ? "Recording..." : "Idle"}
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-success fw-bold px-4" onClick={startListening} disabled={listening}>
                          <i className="fa fa-microphone me-2" /> Start
                        </button>
                        <button type="button" className="btn btn-danger fw-bold px-4" onClick={stopListening} disabled={!listening}>
                          <i className="fa fa-stop me-2" /> Stop
                        </button>
                        <button type="button" className="btn btn-outline-secondary px-3" onClick={resetTranscript}>
                          Clear
                        </button>
                      </div>
                    </div>

                    <Form.Group controlId="speech-text">
                      <Form.Label className="label-style m-0 mb-2">Recognized Speech</Form.Label>
                      <Form.Control
                        required
                        readOnly
                        type="text"
                        placeholder="Speak into your microphone..."
                        name="content"
                        value={transcript}
                        as="textarea"
                        rows={6}
                        className="input-style"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide speech input.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>
              )}
              
              <div className="col-12 mt-5">
                <Button type="submit" className="btn btn-info btn-lg w-100 py-3 fw-bold rounded-pill shadow-lg hover-lift">
                  Generate ISL Video <i className="fa fa-magic ms-2"></i>
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>

      <ConfirmModal show={showModal} onHide={(e) => {
        setShowModal(false)
        navigate('/sign-kit/all-videos', { replace: true })
      }} videoId={videoId} />
      
      <style>{`
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.5) !important; }
        .hover-bg-light:hover { background: rgba(30, 41, 59, 0.8) !important; border-color: rgba(148, 163, 184, 0.5) !important; }
      `}</style>
    </div>
  );
}

export default CreateVideo;
