import React, { useState } from 'react';
import './Feedback.css';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Feedback() {
  const { user, firebaseUser } = useAuth();
  const [rating, setRating] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const levels = [
    { label: 'Very Happy', emoji: '🤩', color: '#00f2fe', glow: 'rgba(0, 242, 254, 0.6)' },
    { label: 'Happy', emoji: '😃', color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
    { label: 'Neutral', emoji: '😐', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' },
    { label: 'Sad', emoji: '🙁', color: '#f97316', glow: 'rgba(249, 115, 22, 0.6)' },
    { label: 'Very Sad', emoji: '😡', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { alert('Please select a satisfaction level.'); return; }
    if (!user) { alert('You must be logged in to submit feedback.'); return; }
    setLoading(true);
    try {
      if (!firebaseUser) {
        alert('You must be logged in to submit feedback.');
        setLoading(false);
        return;
      }
      const token = await firebaseUser.getIdToken();
      const response = await axios.post('/api/feedback', {
        expression: rating,
        feedback_text: comments.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 201) {
        setSubmitted(true);
        setRating('');
        setComments('');
      } else {
        console.error('[Feedback] unexpected status', response);
        alert(response.data?.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('[Feedback] request failed', { status: err.response?.status, data: err.response?.data, message: err.message });
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to submit feedback.';
      alert(msg);
    } finally {
      setLoading(false);
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <div className="w-100 min-vh-100 d-flex flex-column justify-content-center align-items-center pt-5" style={{ background: 'var(--bg-deep, #050811)', color: 'var(--text-main, #f8fafc)' }}>
      <section className="container py-5 text-light" style={{ maxWidth: '850px' }}>
        <h2 className="fw-bold mb-2 text-center" style={{ color: '#ffffff' }}>Rate Your Experience</h2>
        <p className="text-center text-muted mb-4">Your feedback helps us improve Mitra AI.</p>
        {submitted && (
          <div className="alert alert-success bg-opacity-10 text-success border-success mb-4 rounded-3 text-center">
            <i className="fa fa-check-circle me-2"></i>
            Thank you! Your feedback has been submitted successfully.
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-4 rounded-4 shadow-lg" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)' }}>
          <p className="fw-bold small text-uppercase tracking-wider text-muted mb-3">SELECT SATISFACTION LEVEL</p>
          <div className="d-flex flex-nowrap gap-2 gap-md-3 mb-4 overflow-auto pb-1">
            {levels.map(lvl => {
              const isSelected = rating === lvl.label;
              return (
                <button type="button" key={lvl.label} onClick={() => setRating(lvl.label)} className="btn flex-fill p-3 d-flex flex-column align-items-center rounded-3 border-0 transition-all" style={{ minWidth: '100px', background: isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)', border: isSelected ? `1.5px solid ${lvl.color}` : '1px solid rgba(255,255,255,0.08)', boxShadow: isSelected ? `0 0 18px ${lvl.glow}` : 'none', transform: isSelected ? 'translateY(-2px)' : 'none' }}>
                  <span className="mb-1 transition-all" style={{ fontSize: '2.2rem', lineHeight: '1', filter: `drop-shadow(0 0 10px ${lvl.color}) drop-shadow(0 0 20px ${lvl.color})`, opacity: isSelected ? '1' : '0.75' }}>{lvl.emoji}</span>
                  <span className="small fw-semibold mt-1" style={{ color: isSelected ? lvl.color : '#e2e8f0', fontSize: '0.85rem' }}>{lvl.label}</span>
                </button>
              );
            })}
          </div>
          <p className="fw-bold small text-uppercase tracking-wider text-muted mb-2">TELL US MORE ABOUT YOUR EXPERIENCE</p>
          <textarea className="form-control text-light border-secondary mb-4 p-3 rounded-3" rows="4" placeholder="Share your thoughts, suggestions, or issues..." value={comments} onChange={e => setComments(e.target.value)} style={{ background: 'rgba(10, 15, 30, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }} />
          <button type="submit" disabled={loading} className="btn btn-info w-100 py-3 fw-bold text-dark rounded-3 shadow-sm transition-all">{loading ? 'Submitting...' : 'Submit Feedback'}</button>
        </form>
      </section>
    </div>
  );
}

export default Feedback;
