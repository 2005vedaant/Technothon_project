import React from "react";

function VideoCard({ video, handleClick }) {
  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4" onClick={() => handleClick(video._id)} style={{cursor:'pointer'}}>
      <div className="card h-100 card-background border-0 position-relative overflow-hidden">
        {/* Placeholder Thumbnail */ }
        <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '160px', borderBottom: '1px solid #E2E8F0' }}>
            <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="fa fa-play text-primary ms-1"></i>
            </div>
        </div>
        
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title text-dark fw-bold mb-0 text-truncate" title={video.title}>{video.title}</h5>
          </div>
          <p className="card-text text-secondary small mb-0" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {video.desc}
          </p>
        </div>

        <div className="card-footer bg-transparent border-top-0 px-4 pb-4 pt-0">
          <div className="d-flex align-items-center">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-2" style={{width: 32, height: 32, fontSize: '0.8rem'}}>
              {video.createdBy ? video.createdBy.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-muted small fw-medium text-truncate">
                {video.createdBy || 'Unknown User'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
