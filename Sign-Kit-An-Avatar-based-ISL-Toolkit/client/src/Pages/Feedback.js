import React from "react";

function Feedback() {
  const forms = [
    {
      title: "Overall Experience",
      desc: "Tell us what you think about the overall webapp design, satisfaction, appearance, and usability.",
      link: "https://docs.google.com/forms/d/e/1FAIpQLSf1yDHIBGR2EusbGSuk-zBWBwoS5i-Gwm7Rvprw6IhBlWfJTQ/viewform?usp=sf_link",
      icon: "fa-star"
    },
    {
      title: "Audio to Sign Module",
      desc: "Help us know how well our system understands and converts different voices and accents to text accurately.",
      link: "https://docs.google.com/forms/d/e/1FAIpQLSehlA48o3Y_k9ntfHRzY5II6iqhlpaP2iALN7h1sTjYn7Nr4w/viewform?usp=sf_link",
      icon: "fa-microphone"
    },
    {
      title: "Sign Correctness (Experts)",
      desc: "Expert users well versed in Indian Sign Language can help us by verifying the animated signs.",
      link: "https://docs.google.com/forms/d/e/1FAIpQLScDfQ-6EbKgG-nLdjTI7atlA65EnWoQb3mOo3Bl-JtpNhjJuA/viewform?usp=sf_link",
      icon: "fa-check-square-o"
    },
    {
      title: "Sign Correctness (Novice)",
      desc: "Novice users can help by rating the visual similarity of our animated signs with real life recorded signs.",
      link: "https://docs.google.com/forms/d/e/1FAIpQLScEHG6UoqUwhoqzE_KNrLXAMOkSb8xKfSJNRCn52gmF9ksRkw/viewform?usp=sf_link",
      icon: "fa-eye"
    },
    {
      title: "Create Video Module",
      desc: "Let us know if our ISL Video creation module is simple and easy enough to use, or if you want more features.",
      link: "https://docs.google.com/forms/d/e/1FAIpQLScScSh9Mli_1XKQLmNBrCGkWve7jbMqMwHhpiNS-qeNNXgKMA/viewform?usp=sf_link",
      icon: "fa-video-camera"
    }
  ];

  return (
    <div className="container-fluid d-flex flex-column align-items-center px-0 min-vh-100">
      <div className="container-fluid text-white py-5 position-relative overflow-hidden" style={{ background: '#020617' }}>
        <div className="position-absolute rounded-circle opacity-10 blur-3xl" style={{ background: '#3B82F6', width: '400px', height: '400px', top: '-50%', left: '10%', filter: 'blur(100px)' }}></div>
        <div className="container my-5 text-center position-relative z-index-1 fade-in-up">
          <div className="bg-primary bg-opacity-25 p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 64, height: 64 }}>
              <i className="fa fa-comments fs-3 text-primary"></i>
          </div>
          <h1 className="display-4 fw-bold mb-3">Provide Feedback</h1>
          <p className="lead mx-auto text-muted" style={{ maxWidth: '800px', fontSize: '1.2rem' }}>
            Help us improve our AI translations by providing your valuable feedback. 
            Your input directly trains our models and improves accessibility for everyone.
          </p>
        </div>
      </div>

      <div className="container my-5 fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="row g-4 justify-content-center">
          {forms.map((form, index) => (
            <div className="col-md-6 col-lg-4" key={index}>
              <div className="card h-100 card-background border-0 position-relative overflow-hidden">
                <div className="position-absolute top-0 end-0 p-3 opacity-25">
                    <i className={`fa ${form.icon} fs-1 text-info`}></i>
                </div>
                <div className="card-header bg-transparent border-bottom border-secondary py-3">
                  <span className="badge bg-info text-dark fw-bold mb-2">Form {index + 1}</span>
                  <h5 className="card-title text-white mb-0 fw-bold">{form.title}</h5>
                </div>
                <div className="card-body d-flex flex-column p-4">
                  <p className="card-text text-muted mb-4 flex-grow-1" style={{ fontSize: '0.95rem' }}>
                    {form.desc}
                  </p>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={form.link}
                    className="btn btn-outline-info w-100 fw-bold rounded-pill hover-lift"
                  >
                    Open Form <i className="fa fa-external-link ms-2"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.4) !important; }
      `}</style>
    </div>
  );
}

export default Feedback;
