

import React, { useState } from 'react';
import LoginSignup from './LoginSignup';
import axios from 'axios';
import AnnotationCanvas from './AnnotationCanvas';
import { FaTooth, FaUserMd, FaTeethOpen, FaBrush, FaRegSmile, FaUser, FaUserCircle, FaTachometerAlt } from 'react-icons/fa';


function App() {
  const [role, setRole] = useState('');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [annotation, setAnnotation] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Patient submit
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('patientId', patientId);
    formData.append('email', email);
    formData.append('note', note);
    formData.append('image', image);
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/submit', formData);
      alert('Submitted!');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin fetch submissions
  const fetchSubmissions = async () => {
    const res = await axios.get('http://localhost:5000/api/submissions');
    setSubmissions(res.data);
  };

  // Admin annotate
  const [savingAnnotation, setSavingAnnotation] = useState(false);
  const annotate = async (annotationData) => {
    setSavingAnnotation(true);
    try {
      await axios.post(`http://localhost:5000/api/annotate/${selectedId}`, {
        annotation: JSON.stringify(annotationData.shapes),
        annotatedImage: annotationData.annotatedImage
      });
      setReportUrl(`http://localhost:5000/api/report/${selectedId}`);
      alert('Annotation saved and report generated!');
      setSelectedSubmission(null);
      setSelectedId('');
      fetchSubmissions();
    } catch (err) {
      alert('Error saving annotation. Please try again.');
    }
    setSavingAnnotation(false);
  };

  // Show login/signup first
  if (!user) {
    return <LoginSignup onAuth={(u, t) => { setUser(u); setToken(t); setRole(u.role); }} />;
  }

  // Patient page
  if (role === 'patient') {
    return (
      <div className="oralvis-patient">
        <header className="oralvis-header">
          <FaTooth size={36} style={{ color: '#1976d2', marginRight: 10 }} />
          <span className="oralvis-title">ORALVIS</span>
        </header>
        <nav className="oralvis-navbar">
          <span className="nav-item"><FaUserCircle style={{ marginRight: 6 }} />Profile</span>
          <span className="nav-item"><FaTachometerAlt style={{ marginRight: 6 }} />Dashboard</span>
        </nav>
        <h2><FaRegSmile style={{ marginRight: 8 }} />Patient Submission</h2>
  <form className="patient-form" onSubmit={e => {e.preventDefault(); submit();}}>
          <label>
            <FaUser style={{ marginRight: 6 }} /> Name:
            <input className="input-details" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label>
            <FaUser style={{ marginRight: 6 }} /> Patient ID:
            <input className="input-details" placeholder="Patient ID" value={patientId} onChange={e => setPatientId(e.target.value)} />
          </label>
          <label>
            <FaUser style={{ marginRight: 6 }} /> Email:
            <input className="input-details" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label>
            <FaBrush style={{ marginRight: 6 }} /> Note:
            <textarea className="input-details" placeholder="Note" value={note} onChange={e => setNote(e.target.value)} />
          </label>
          <label>
            <FaTooth style={{ marginRight: 6 }} /> Upload Teeth Photo:
            <input className="input-file" type="file" onChange={e => setImage(e.target.files[0])} />
          </label>
          <button className="submit-btn dentist-btn" type="submit" disabled={submitting} style={{ opacity: submitting ? 0.6 : 1 }}><FaTeethOpen style={{ marginRight: 8 }} />{submitting ? 'Submitting...' : 'Submit'}</button>
        </form>
  <button className="back-btn dentist-btn" onClick={() => setRole('')} style={{ marginTop: 10 }}><FaUserMd style={{ marginRight: 8 }} />Back</button>
      </div>
    );
  }

  // Admin page
  if (role === 'admin') {
    return (
      <div className="oralvis-admin">
        <header className="oralvis-header">
          <FaUserMd size={36} style={{ color: '#1976d2', marginRight: 10 }} />
          <span className="oralvis-title">ORALVIS</span>
        </header>
        <nav className="oralvis-navbar">
          <span className="nav-item"><FaUserCircle style={{ marginRight: 6 }} />Profile</span>
          <span className="nav-item"><FaTachometerAlt style={{ marginRight: 6 }} />Dashboard</span>
        </nav>
        <h2><FaUserMd style={{ marginRight: 8 }} />Admin Dashboard</h2>
        <button className="load-btn dentist-btn" onClick={fetchSubmissions}><FaTeethOpen style={{ marginRight: 8 }} />Load Submissions</button>
        <div className="submissions-list">
          {submissions.map(sub => (
            <div className="submission-card" key={sub._id}>
              <div className="submission-info">
                <b><FaUser style={{ marginRight: 4 }} /> Name:</b> {sub.name}<br />
                <b><FaUser style={{ marginRight: 4 }} /> Patient ID:</b> {sub.patientId}<br />
                <b><FaUser style={{ marginRight: 4 }} /> Email:</b> {sub.email}<br />
                <b><FaBrush style={{ marginRight: 4 }} /> Note:</b> {sub.note}<br />
                <b>Status:</b> {sub.status}
              </div>
              {sub.image && (
                <div className="submission-image"><img src={`http://localhost:5000/static_media/${sub.image}`} alt="teeth" width={120} /></div>
              )}
              <button className="annotate-btn dentist-btn" onClick={() => {
                setSelectedId(sub._id);
                setSelectedSubmission(sub);
              }}><FaBrush style={{ marginRight: 8 }} />Annotate</button>
            </div>
          ))}
        </div>
        {selectedSubmission && (
          <div className="annotation-section">
            <h3><FaBrush style={{ marginRight: 8 }} />Annotate Image</h3>
            <AnnotationCanvas
              imageUrl={`http://localhost:5000/static_media/${selectedSubmission.image}`}
              onSave={savingAnnotation ? () => {} : annotate}
            />
            <div style={{ marginTop: 10 }}>
              <button className="generate-btn" disabled={savingAnnotation} style={{ opacity: savingAnnotation ? 0.6 : 1 }} onClick={() => {}}>
                {savingAnnotation ? 'Saving...' : 'Save Annotation'}
              </button>
            </div>
            {reportUrl && (
              <div className="report-link"><a href={reportUrl} target="_blank" rel="noopener noreferrer">Download Report</a></div>
            )}
          </div>
        )}
        <button className="back-btn dentist-btn" onClick={() => setRole('')}><FaUser style={{ marginRight: 8 }} />Back</button>
      </div>
    );
  }

  return null;
}

export default App;
