import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import VideoCard from "../Components/Videos/VideoCard";
import { baseURL } from "../Config/config";

function Videos() {
  const [videos, setVideos] = useState([]);
  const [videoId, setVideoId] = useState("");
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const retrieveVideos = () => {
    axios
      .get(`${baseURL}/videos/all-videos`)
      .then((res) => {
        setVideos(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(retrieveVideos, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!videoId) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    navigate(`/sign-kit/video/${videoId}`, { replace: false });
  };

  const handleClick = (videoId) => {
    navigate(`/sign-kit/video/${videoId}`, { replace: false });
  };

  const videoList = videos.map((video, index) => (
    <VideoCard key={index} video={video} handleClick={handleClick} />
  ));

  return (
    <div className="container-fluid d-flex flex-column align-items-center px-0 min-vh-100">
      <div className="container-fluid text-white py-5 position-relative overflow-hidden" style={{ background: '#020617' }}>
        <div className="position-absolute rounded-circle opacity-10 blur-3xl" style={{ background: '#06B6D4', width: '300px', height: '300px', top: '-50%', right: '10%', filter: 'blur(80px)' }}></div>
        <div className="container my-5 text-center position-relative z-index-1 fade-in-up">
          <h1 className="display-4 fw-bold mb-4">Explore ISL Videos</h1>
          <p className="lead mx-auto text-muted" style={{ maxWidth: '800px', fontSize: '1.2rem' }}>
            Welcome to the community video section of Sign Kit. Create your own public
            or private videos, share with colleagues, or browse
            through creations shared by the entire community.
          </p>
        </div>
      </div>

      <div className="container my-5">
        <section id="create-video" className="mb-5 p-5 card-background text-center fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-info bg-opacity-25 p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 64, height: 64 }}>
              <i className="fa fa-video-camera fs-3 text-info"></i>
          </div>
          <h2 className="section-heading text-white">Create a new video</h2>
          <div className="divider mx-auto my-3 bg-info" />
          <p className="normal-text text-muted mb-5">
            Provide your content via text, speech or file and keep the videos private or share
            them with the entire community. Each video generates a unique Video ID.
          </p>
          <Link to='/sign-kit/create-video' className="btn btn-info btn-lg px-5 py-3 fw-bold text-white shadow-lg rounded-pill hover-lift">
            <i className="fa fa-plus me-2"></i> Create your own Video
          </Link>
        </section>

        <section id="open-video" className="mb-5 p-5 card-background fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-5">
            <h2 className="section-heading text-white">Open a video</h2>
            <div className="divider mx-auto my-3 bg-info" />
            <p className="normal-text text-muted">
              Have a Video ID? Enter it below to directly access private or public content.
            </p>
          </div>
          <div className="row justify-content-center">
            <Form
              noValidate
              validated={validated}
              onSubmit={handleSubmit}
              className="col-md-8 col-lg-6"
            >
              <Form.Group controlId="videoId" className="mb-4">
                <Form.Label className="fw-semibold text-muted text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.85rem' }}>Enter Video ID</Form.Label>
                <div className="input-group input-group-lg shadow-sm">
                  <span className="input-group-text bg-dark border-secondary text-muted px-4" style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
                      <i className="fa fa-key"></i>
                  </span>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g. 12345-abcde"
                    value={videoId}
                    name="title"
                    className="input-style border-start-0 ps-0"
                    onChange={(e) => setVideoId(e.target.value)}
                    style={{ background: 'rgba(15, 23, 42, 0.6)' }}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid video ID.
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
              <div className="text-center mt-5">
                <Button type="submit" className="btn btn-outline-info px-5 py-3 fw-bold rounded-pill">
                  Open Video <i className="fa fa-arrow-right ms-2"></i>
                </Button>
              </div>
            </Form>
          </div>
        </section>

        <section id="video-feed" className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-5 mt-5 pt-4">
            <h2 className="section-heading text-white">Community Feed</h2>
            <div className="divider mx-auto my-3 bg-info" />
            <p className="normal-text text-muted">
              Browse through ISL videos shared by the community.
            </p>
          </div>
          
          <div className="row g-4 justify-content-center">
            {videoList.length > 0 ? videoList : (
                <div className="col-12 text-center py-5">
                    <div className="spinner-border text-info opacity-50" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
          </div>
        </section>
      </div>
      <style>{`
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.5) !important; }
      `}</style>
    </div>
  );
}

export default Videos;
