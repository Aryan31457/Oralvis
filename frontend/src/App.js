import React, { useState, useEffect } from 'react';
import LoginSignup from './LoginSignup';
import axios from 'axios';
import AnnotationCanvas from './AnnotationCanvas';
import { 
  FaTooth, 
  FaUserMd, 
  FaTeethOpen, 
  FaBrush, 
  FaRegSmile, 
  FaUser, 
  FaUserCircle, 
  FaTachometerAlt,
  FaCalendarAlt,
  FaHistory,
  FaBookMedical,
  FaPlus,
  FaFilePdf,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaUserInjured,
  FaSearch,
  FaChevronRight,
  FaClipboardList,
  FaImages,
  FaHeartbeat,
  FaPills
} from 'react-icons/fa';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5000';

const CLINICAL_CASES = [
  {
    id: 'decay',
    title: 'Tooth Decay (Dental Caries)',
    subtitle: 'Enamel Erosion & Cavities',
    severity: 'Moderate to High',
    description: 'Bacterial plaque produces acids that eat away at the hard outer enamel, eventually breaking into the softer dentin and pulp layers of the tooth, causing cavities and infections.',
    symptoms: [
      'Tooth sensitivity to hot, cold, or sweet foods',
      'Visible holes or pits in the teeth',
      'Mild to sharp pain when biting down',
      'Dark stains (black or brown) on the tooth surfaces'
    ],
    causes: [
      'Frequent consumption of sugary/starchy foods',
      'Poor oral hygiene (insufficient brushing/flossing)',
      'Dry mouth (lack of saliva which buffers acid)',
      'Lack of fluoride protection'
    ],
    explanation: '“Think of your tooth like a house. The outer layer (enamel) is a strong concrete wall. Plaque bacteria release acid that acts like acid rain, slowly eating a hole through the wall. If we don’t fill it now, the rain (bacteria) will reach the wooden beams (nerve) inside, requiring a root canal.”',
    treatment: 'Dental filling (composite/silver), root canal therapy, or a dental crown depending on depth.',
    color: '#d32f2f'
  },
  {
    id: 'gum',
    title: 'Gingivitis & Periodontitis',
    subtitle: 'Gum Inflammation & Bone Loss',
    severity: 'High (if chronic)',
    description: 'Plaque buildup at the gumline leads to inflammation (Gingivitis). Left untreated, it progresses to Periodontitis, where the gums pull away from the teeth, forming infected pockets that destroy the bone supporting the teeth.',
    symptoms: [
      'Red, swollen, or tender gums',
      'Bleeding during brushing or flossing',
      'Persistent bad breath (halitosis)',
      'Receding gumline making teeth look longer',
      'Loose or shifting teeth'
    ],
    causes: [
      'Accumulated tartar (hardened plaque)',
      'Smoking or tobacco use',
      'Hormonal changes (pregnancy, menopause)',
      'Systemic diseases (diabetes, cardiovascular issues)'
    ],
    explanation: '“Your teeth are anchored in the jawbone, protected by a seal of gum tissue. Plaque buildup acts like dirt under a seal. It irritates the gums, causing them to bleed and slowly pull away. Eventually, the bone around the tooth dissolves, making the tooth loose like a post in muddy ground.”',
    treatment: 'Scaling and root planing (deep cleaning), localized antibiotics, or periodontal surgery (gum graft).',
    color: '#800000'
  },
  {
    id: 'malalignment',
    title: 'Malocclusion (Malaligned Teeth)',
    subtitle: 'Crowding, Overbite, or Underbite',
    severity: 'Low to Moderate',
    description: 'Malalignment refers to teeth that are crowded, crooked, or misaligned, preventing a proper bite pattern. This can lead to jaw strain, uneven wear, and increased risk of decay due to cleaning difficulty.',
    symptoms: [
      'Visibly crooked or overlapping teeth',
      'Difficulty chewing or biting properly',
      'Frequent biting of the inner cheeks or tongue',
      'Lisp or other minor speech changes'
    ],
    causes: [
      'Genetics (jaw size relative to tooth size)',
      'Early loss of baby teeth',
      'Childhood habits (thumb sucking, tongue thrusting)'
    ],
    explanation: '“When teeth are crowded or rotated, they create tight spaces that a toothbrush cannot reach. This leaves food trapped, leading to cavities between the teeth. Aligning them doesn’t just improve your smile; it makes it much easier to keep your teeth clean and healthy.”',
    treatment: 'Orthodontic braces, clear aligners (Invisalign), or dental expanders.',
    color: '#ff9800'
  },
  {
    id: 'stains',
    title: 'Tooth Discoloration & Stains',
    subtitle: 'Extrinsic vs. Intrinsic Staining',
    severity: 'Low',
    description: 'Extrinsic stains affect the outer enamel surface due to pigments from food, drinks, or smoking. Intrinsic staining occurs within the inner structure (dentin) from aging, trauma, or exposure to certain medications like tetracycline.',
    symptoms: [
      'Yellowish, brownish, or dark gray spots',
      'General loss of tooth brightness',
      'Uneven tooth color across different sections'
    ],
    causes: [
      'Consuming coffee, tea, red wine, or dark sodas',
      'Tobacco use (smoking or chewing)',
      'Poor brushing habits',
      'Natural aging process'
    ],
    explanation: '“Enamel is actually like a sponge with micro-pores. Over time, pigments from dark beverages and smoking seep into these pores, staining the tooth. A professional cleaning polishes away surface stains, and whitening treatments deep-clean the pores to restore your natural shade.”',
    treatment: 'Prophylaxis (cleaning & polishing), professional teeth whitening, or dental veneers for intrinsic staining.',
    color: '#00bcd4'
  },
  {
    id: 'attrition',
    title: 'Tooth Attrition & Bruxism',
    subtitle: 'Tooth Wear & Teeth Grinding',
    severity: 'Moderate',
    description: 'Attrition is the loss of tooth structure (enamel and dentin) caused by tooth-to-tooth contact. This is often driven by Bruxism (unconscious grinding or clenching of teeth, particularly during sleep).',
    symptoms: [
      'Flattened, chipped, or worn-down chewing surfaces',
      'Increased tooth sensitivity as dentin becomes exposed',
      'Dull headache starting in the temples',
      'Jaw muscle tightness, pain, or clicking sounds'
    ],
    causes: [
      'Stress or anxiety',
      'Sleep apnea or sleep disorders',
      'Misaligned bite (occlusion problems)'
    ],
    explanation: '“When you grind your teeth at night, you exert pressure up to 10 times harder than during normal chewing. This acts like sandpaper, grinding away the protective enamel cap and exposing the sensitive yellow dentin underneath. We need to protect your teeth with a night guard.”',
    treatment: 'Custom-fitted night guard (splint), composite bonding to restore lost structure, or crowns.',
    color: '#9c27b0'
  }
];

function App() {
  const [role, setRole] = useState('');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'treated', 'appointments', 'cases'
  const [patientTab, setPatientTab] = useState('upload'); // 'upload', 'profile', 'history', 'careplan', 'appointments'

  // Patient Submissions Form
  const [name, setName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  
  // Patient Scheduling Form
  const [patientApptTime, setPatientApptTime] = useState('');
  const [patientApptReason, setPatientApptReason] = useState('');
  
  // Dentist Workstation
  const [selectedId, setSelectedId] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reportUrl, setReportUrl] = useState('');
  const [adminCarePlan, setAdminCarePlan] = useState('');
  const [adminMedications, setAdminMedications] = useState('');
  const [aiDiagnosing, setAiDiagnosing] = useState(false);
  const [aiShapes, setAiShapes] = useState([]);
  const [aiFindings, setAiFindings] = useState('');
  const [careTags, setCareTags] = useState(['Brush 2x Daily', 'Warm Salt Water Rinse', 'Daily Flossing', 'Soft-Bristled Brush', 'Avoid Sweet Foods']);
  const [medTags, setMedTags] = useState(['Chlorhexidine Rinse (2x/day)', 'Paracetamol 500mg (Pain)', 'Sensodyne Paste', 'Amoxicillin 500mg (Infection)', 'Ibuprofen 400mg']);
  const [newCareTag, setNewCareTag] = useState('');
  const [newMedTag, setNewMedTag] = useState('');
  
  // Patient Card Scan Upload
  const [uploadingForPatientId, setUploadingForPatientId] = useState('');
  const [patientUploadImages, setPatientUploadImages] = useState([]);
  const [patientUploadNote, setPatientUploadNote] = useState('');
  const [isUploadingScan, setIsUploadingScan] = useState(false);

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [newApptName, setNewApptName] = useState('');
  const [newApptId, setNewApptId] = useState('');
  const [newApptTime, setNewApptTime] = useState('');
  const [newApptReason, setNewApptReason] = useState('');

  // Library & UI Filter
  const [selectedCase, setSelectedCase] = useState(CLINICAL_CASES[0]);
  const [treatedSearch, setTreatedSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingAnnotation, setSavingAnnotation] = useState(false);

  // Dentist Walk-in Submission states
  const [adminPatientName, setAdminPatientName] = useState('');
  const [adminPatientId, setAdminPatientId] = useState('');
  const [adminPatientEmail, setAdminPatientEmail] = useState('');
  const [adminPatientNote, setAdminPatientNote] = useState('');
  const [adminPatientImage, setAdminPatientImage] = useState(null);
  const [adminSubmittingScan, setAdminSubmittingScan] = useState(false);
  const [showAddScanForm, setShowAddScanForm] = useState(false);

  // Care Plan checkboxes
  const [careCheckboxes, setCareCheckboxes] = useState({});

  // Resolve Patient ID helper
  const getPatientId = (emailAddress) => {
    if (!emailAddress) return '';
    if (emailAddress === 'alice@example.com') return 'P1005';
    if (emailAddress === 'patient@dentiva.com') return 'P1024';
    return 'P' + emailAddress.split('@')[0].toUpperCase().slice(0, 4).replace(/[^a-zA-Z0-9]/g, '');
  };

  // Load backend data
  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/submissions`);
      setSubmissions(res.data);
    } catch (err) {
      console.error('Error fetching submissions', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/appointments`);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubmissions();
      fetchAppointments();
      
      // Auto-populate patient details if role is patient
      if (role === 'patient' || user.role === 'patient' || user.role === 'user') {
        setName(user.name || '');
        setEmail(user.email || '');
        setPatientId(getPatientId(user.email));
      }
    }
  }, [user, role]);

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setToken('');
    setRole('');
  };

  // Patient submit scan
  const submit = async () => {
    const resolvedName = name || user.name;
    const resolvedEmail = email || user.email;
    const resolvedPid = patientId || getPatientId(user.email);

    if (!resolvedName || !resolvedPid || !resolvedEmail) {
      alert('Please fill out Name, Patient ID, and Email.');
      return;
    }

    const formData = new FormData();
    formData.append('name', resolvedName);
    formData.append('patientId', resolvedPid);
    formData.append('email', resolvedEmail);
    formData.append('note', note);
    if (image) formData.append('image', image);
    
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/submit`, formData);
      alert('Teeth scan details submitted successfully!');
      setNote('');
      setImage(null);
      fetchSubmissions();
    } catch (err) {
      alert('Error submitting details.');
    } finally {
      setSubmitting(false);
    }
  };

  // Dentist Walk-in submit
  const handleAdminSubmitScan = async (e) => {
    e.preventDefault();
    if (!adminPatientName || !adminPatientId || !adminPatientEmail) {
      alert('Please fill out Patient Name, ID, and Email.');
      return;
    }
    const formData = new FormData();
    formData.append('name', adminPatientName);
    formData.append('patientId', adminPatientId);
    formData.append('email', adminPatientEmail);
    formData.append('note', adminPatientNote);
    if (adminPatientImage) {
      formData.append('image', adminPatientImage);
    }

    setAdminSubmittingScan(true);
    try {
      await axios.post(`${API_BASE_URL}/api/submit`, formData);
      alert('Patient scan registered successfully!');
      // Reset form
      setAdminPatientName('');
      setAdminPatientId('');
      setAdminPatientEmail('');
      setAdminPatientNote('');
      setAdminPatientImage(null);
      setShowAddScanForm(false);
      // Refresh submissions
      fetchSubmissions();
    } catch (err) {
      alert('Error registering patient scan.');
    } finally {
      setAdminSubmittingScan(false);
    }
  };

  // Admin annotate
  const annotate = async (annotationData) => {
    setSavingAnnotation(true);
    try {
      await axios.post(`${API_BASE_URL}/api/annotate/${selectedId}`, {
        annotation: JSON.stringify(annotationData.shapes),
        annotatedImage: annotationData.annotatedImage,
        carePlan: adminCarePlan,
        medications: adminMedications
      });
      setReportUrl(`${API_BASE_URL}/api/report/${selectedId}`);
      alert('Annotation saved and report generated!');
      setSelectedSubmission(null);
      setSelectedId('');
      setAdminCarePlan('');
      setAdminMedications('');
      fetchSubmissions();
    } catch (err) {
      alert('Error saving annotation. Please try again.');
    }
    setSavingAnnotation(false);
  };

  // Google Gemini AI Auto-Diagnosis
  const handleAiDiagnose = async () => {
    setAiDiagnosing(true);
    setAiFindings('');
    setAiShapes([]);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/submissions/${selectedId}/ai-diagnose`);
      if (res.data.success) {
        setAdminCarePlan(res.data.carePlan || '');
        setAdminMedications(res.data.medications || '');
        setAiShapes(res.data.shapes || []);
        setAiFindings(res.data.findings || '');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'AI Auto-Diagnosis failed.');
    } finally {
      setAiDiagnosing(false);
    }
  };

  // Upload scan for a specific patient from their Treated Patients card
  const handlePatientCardUpload = async (e, patient) => {
    e.preventDefault();
    if (patientUploadImages.length === 0) {
      alert('Please select at least one image.');
      return;
    }

    setIsUploadingScan(true);
    const formData = new FormData();
    formData.append('name', patient.name);
    formData.append('patientId', patient.patientId);
    formData.append('email', patient.email);
    formData.append('note', patientUploadNote || 'Walk-in follow-up scan.');
    
    patientUploadImages.forEach(file => {
      formData.append('images', file);
    });

    try {
      await axios.post(`${API_BASE_URL}/api/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('New scan(s) successfully uploaded and added to Pending Scans!');
      setUploadingForPatientId('');
      setPatientUploadImages([]);
      setPatientUploadNote('');
      fetchSubmissions();
      setActiveTab('pending');
    } catch (err) {
      alert('Failed to upload scan(s). Please try again.');
    } finally {
      setIsUploadingScan(false);
    }
  };

  // Create Appointment
  const createAppointment = async (e) => {
    e.preventDefault();
    if (!newApptName || !newApptId || !newApptTime) {
      alert('Please fill in Patient Name, ID, and Time.');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/appointments`, {
        name: newApptName,
        patientId: newApptId,
        time: newApptTime,
        reason: newApptReason
      });
      alert('Appointment scheduled successfully!');
      setNewApptName('');
      setNewApptId('');
      setNewApptTime('');
      setNewApptReason('');
      fetchAppointments();
    } catch (err) {
      alert('Error scheduling appointment.');
    }
  };

  // Patient schedule appointment
  const handlePatientScheduleAppt = async (e) => {
    e.preventDefault();
    if (!patientApptTime) {
      alert('Please enter a time.');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/appointments`, {
        name: user.name,
        patientId: getPatientId(user.email),
        time: patientApptTime,
        reason: patientApptReason || 'General Consultation'
      });
      alert('Appointment booked successfully!');
      setPatientApptTime('');
      setPatientApptReason('');
      fetchAppointments();
    } catch (err) {
      alert('Error scheduling appointment.');
    }
  };

  // Update Appointment Status
  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.post(`${API_BASE_URL}/api/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert('Error updating status.');
    }
  };

  // Submissions lists
  const pendingSubmissions = submissions.filter(sub => sub.status !== 'annotated');
  const treatedPatients = submissions.filter(sub => sub.status === 'annotated');

  // Filter treated patients by search
  const filteredTreated = treatedPatients.filter(
    sub =>
      sub.name.toLowerCase().includes(treatedSearch.toLowerCase()) ||
      sub.patientId.toLowerCase().includes(treatedSearch.toLowerCase())
  );

  // Patient Submissions matching logged-in user
  const mySubmissions = submissions.filter(
    sub => sub.email === user.email || sub.patientId === getPatientId(user.email)
  );
  const myTreatedSubmissions = mySubmissions.filter(sub => sub.status === 'annotated');
  
  // Patient Appointments matching logged-in user
  const myAppointments = appointments.filter(
    appt => appt.name === user.name || appt.patientId === getPatientId(user.email)
  );

  // Fallback image helper
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%23f1f5f9"/><path d="M25 35 C25 20, 45 20, 45 35 C45 40, 42 45, 42 55 C42 62, 45 68, 35 68 C25 68, 28 62, 28 55 C28 45, 25 40, 25 35 Z" fill="%23cbd5e1" stroke="%2394a3b8" stroke-width="2"/><path d="M75 35 C75 20, 55 20, 55 35 C55 40, 58 45, 58 55 C58 62, 55 68, 65 68 C75 68, 72 62, 72 55 C72 45, 75 40, 75 35 Z" fill="%23cbd5e1" stroke="%2394a3b8" stroke-width="2"/><text x="50" y="85" font-family="sans-serif" font-size="8" text-anchor="middle" fill="%2364748b">No Dental Scan</text></svg>';
  };

  // Toggle checklist
  const toggleCareCheck = (id) => {
    setCareCheckboxes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Show login/signup first
  if (!user) {
    return <LoginSignup onAuth={(u, t) => { setUser(u); setToken(t); setRole(u.role); }} />;
  }

  // Patient page
  if (role === 'patient' || role === 'user') {
    const resolvedPid = getPatientId(user.email);
    return (
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <FaTooth className="sidebar-logo" />
            <div className="brand-texts">
              <span className="brand-name">DENTIVA</span>
              <span className="brand-role">Patient Portal</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button 
              className={`menu-item ${patientTab === 'upload' ? 'active' : ''}`}
              onClick={() => setPatientTab('upload')}
            >
              <FaTachometerAlt className="menu-icon" />
              <span>Submit Dental Scan</span>
            </button>

            <button 
              className={`menu-item ${patientTab === 'profile' ? 'active' : ''}`}
              onClick={() => setPatientTab('profile')}
            >
              <FaUserCircle className="menu-icon" />
              <span>My Profile</span>
            </button>

            <button 
              className={`menu-item ${patientTab === 'history' ? 'active' : ''}`}
              onClick={() => setPatientTab('history')}
            >
              <FaHistory className="menu-icon" />
              <span>Medical History</span>
            </button>

            <button 
              className={`menu-item ${patientTab === 'careplan' ? 'active' : ''}`}
              onClick={() => setPatientTab('careplan')}
            >
              <FaHeartbeat className="menu-icon" />
              <span>Care Plan & Meds</span>
            </button>

            <button 
              className={`menu-item ${patientTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setPatientTab('appointments')}
            >
              <FaCalendarAlt className="menu-icon" />
              <span>Appointments</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="admin-profile">
              <FaUserCircle className="profile-avatar" />
              <div className="profile-details">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role">Patient</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt style={{ marginRight: 8 }} /> Log Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main">
          {/* Header Bar */}
          <header className="main-header">
            <div className="header-title">
              <h2>
                {patientTab === 'upload' && 'Submit Dental Scan'}
                {patientTab === 'profile' && 'My Profile'}
                {patientTab === 'history' && 'Medical Diagnostics History'}
                {patientTab === 'careplan' && 'Suggested Care Plan & Medications'}
                {patientTab === 'appointments' && 'Schedule & Appointments'}
              </h2>
              <p className="header-subtitle">
                {patientTab === 'upload' && 'Upload teeth scan photos for automatic diagnostics review'}
                {patientTab === 'profile' && 'Manage your personal medical profile parameters'}
                {patientTab === 'history' && 'View your past checkups and download clinical reports'}
                {patientTab === 'careplan' && 'Clinical instructions and medications prescribed by your doctor'}
                {patientTab === 'appointments' && 'Schedule slots and view upcoming checkups'}
              </p>
            </div>
          </header>

          <div className="content-body">
            
            {/* TAB: SUBMIT SCAN */}
            {patientTab === 'upload' && (
              <div className="portal-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                <section className="form-card">
                  <h3><FaTeethOpen style={{ marginRight: 8, color: '#3b82f6' }} /> Submit Dental Scan</h3>
                  <form className="patient-form" onSubmit={e => {e.preventDefault(); submit();}}>
                    <div className="form-row">
                      <div className="form-group">
                        <label><FaUser className="input-icon" /> Full Name</label>
                        <input type="text" value={user.name} disabled style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} />
                      </div>
                      <div className="form-group">
                        <label><FaUserInjured className="input-icon" /> Patient ID</label>
                        <input type="text" value={resolvedPid} disabled style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label><FaUserCircle className="input-icon" /> Email Address</label>
                      <input type="email" value={user.email} disabled style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pnote"><FaBrush className="input-icon" /> Symptoms & Notes</label>
                      <textarea 
                        id="pnote" 
                        placeholder="Describe any symptoms, pain, bleeding, or issues you want checked..." 
                        value={note} 
                        onChange={e => setNote(e.target.value)} 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pimage"><FaTooth className="input-icon" /> Upload Teeth/Gum Photo</label>
                      <div className="file-upload-wrapper">
                        <input 
                          id="pimage" 
                          type="file" 
                          className="input-file-hidden" 
                          onChange={e => setImage(e.target.files[0])} 
                        />
                        <div className="file-upload-display">
                          <FaImages className="upload-icon" />
                          <span>{image ? image.name : 'Select or drag an image file...'}</span>
                        </div>
                      </div>
                    </div>

                    <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
                      <FaTeethOpen style={{ marginRight: 8 }} />
                      {submitting ? 'Submitting details...' : 'Submit to Dentist'}
                    </button>
                  </form>
                </section>

                <section className="info-sidebar">
                  <div className="guideline-card">
                    <h4><FaInfoCircle style={{ marginRight: 6, color: '#3b82f6' }} /> How to take a good scan</h4>
                    <ul>
                      <li>Use a bright room or your phone's flashlight.</li>
                      <li>Keep the camera in focus and pull cheeks back slightly.</li>
                      <li>Ensure the area of concern is clearly visible.</li>
                      <li>Avoid blurry pictures to ensure accurate reports.</li>
                    </ul>
                  </div>
                  <div className="guideline-card dark-card">
                    <h4>Secure Clinical Portal</h4>
                    <p>Your photo is encrypted and shared directly with your licensed practitioner. Diagnostic reports will be generated upon review.</p>
                  </div>
                </section>
              </div>
            )}

            {/* TAB: VIEW PROFILE */}
            {patientTab === 'profile' && (
              <div className="portal-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                <section className="form-card">
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <FaUserCircle size={80} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                    <h3>{user.name}</h3>
                    <span className="status-pill status-confirmed" style={{ fontSize: '0.85rem' }}>Active Patient</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>Patient ID:</strong>
                      <span style={{ fontWeight: '600' }}>{resolvedPid}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>Email Address:</strong>
                      <span>{user.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>Record Created:</strong>
                      <span>July 9, 2026</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>Assigned Dentist:</strong>
                      <span>Dr. John Doe</span>
                    </div>
                  </div>
                </section>

                <section className="info-sidebar">
                  <div className="guideline-card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <h4>Oral Health Parameters</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                      <div>
                        <small style={{ color: 'var(--text-light)', display: 'block', fontWeight: 600 }}>Gum Index</small>
                        <strong style={{ color: 'var(--success)' }}>Healthy (Scaling Up-to-date)</strong>
                      </div>
                      <div>
                        <small style={{ color: 'var(--text-light)', display: 'block', fontWeight: 600 }}>Diagnoses Pending</small>
                        <strong>{mySubmissions.filter(s => s.status !== 'annotated').length} Scan(s)</strong>
                      </div>
                      <div>
                        <small style={{ color: 'var(--text-light)', display: 'block', fontWeight: 600 }}>Treated Diagnoses</small>
                        <strong>{myTreatedSubmissions.length} Case(s)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="guideline-card">
                    <h4>Clinic Contact Details</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <strong>Phone:</strong> +1 (555) 019-2834
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong>Hours:</strong> Mon-Fri, 9:00 AM - 5:00 PM
                    </p>
                  </div>
                </section>
              </div>
            )}

            {/* TAB: DIAGNOSIS HISTORY */}
            {patientTab === 'history' && (
              <div className="history-pane" style={{ animation: 'fadeIn 0.3s ease' }}>
                {mySubmissions.length === 0 ? (
                  <div className="empty-state">
                    <FaHistory className="empty-state-icon" />
                    <h3>No medical history found</h3>
                    <p>Submit a teeth scan to begin your diagnostic review records.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {mySubmissions.map(sub => (
                      <div className="treated-patient-card" key={sub._id}>
                        <div className="treated-header">
                          <div className="patient-meta">
                            <h4>Scan date: {new Date(Number(sub._id) || Date.now()).toLocaleDateString()}</h4>
                            <span className="id-sub-badge">ID: {sub._id}</span>
                          </div>
                          <span className={`status-pill ${sub.status === 'annotated' ? 'status-confirmed' : 'status-pending'}`}>
                            {sub.status === 'annotated' ? 'Reviewed & Diagnosed' : 'Pending Review'}
                          </span>
                        </div>

                        <div className="treated-content-details" style={{ marginTop: '12px' }}>
                          <div className="treated-notes">
                            <strong>Symptoms Note:</strong>
                            <p>"{sub.note || 'No notes provided'}"</p>
                            
                            {sub.status === 'annotated' && (
                              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {sub.carePlan && (
                                  <div>
                                    <strong style={{ color: 'var(--primary)' }}><FaHeartbeat /> Suggested Care Plan:</strong>
                                    <p style={{ fontStyle: 'normal', color: 'var(--text-secondary)', marginTop: '4px' }}>{sub.carePlan}</p>
                                  </div>
                                )}
                                {sub.medications && (
                                  <div>
                                    <strong style={{ color: 'var(--info)' }}><FaPills /> Prescribed Medications:</strong>
                                    <p style={{ fontStyle: 'normal', color: 'var(--text-secondary)', marginTop: '4px' }}>{sub.medications}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                            {sub.image && (
                              sub.status === 'annotated' && sub.annotatedImage ? (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                  <div style={{ textAlign: 'center' }}>
                                    <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '2px' }}>Original</small>
                                    <img 
                                      src={sub.image || ''} 
                                      alt="Original Teeth Scan" 
                                      width={100} 
                                      style={{ borderRadius: '6px', border: '1px solid var(--border)' }}
                                      onError={handleImageError}
                                    />
                                  </div>
                                  <div style={{ textAlign: 'center' }}>
                                    <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '2px', fontWeight: 600 }}>Annotated</small>
                                    <img 
                                      src={sub.annotatedImage || ''} 
                                      alt="Annotated Teeth Scan" 
                                      width={100} 
                                      style={{ borderRadius: '6px', border: '2px solid var(--primary)' }}
                                      onError={handleImageError}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <img 
                                  src={sub.image || ''} 
                                  alt="Original Teeth Scan" 
                                  width={120} 
                                  style={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                                  onError={handleImageError}
                                />
                              )
                            )}
                            {sub.status === 'annotated' && sub.report && (
                              <a 
                                className="btn btn-secondary btn-sm" 
                                href={`${API_BASE_URL}/api/report/${sub._id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <FaFilePdf style={{ marginRight: 6, color: '#ef4444' }} /> Download Report
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CARE PLAN */}
            {patientTab === 'careplan' && (
              <div className="careplan-pane" style={{ animation: 'fadeIn 0.3s ease' }}>
                {myTreatedSubmissions.length === 0 ? (
                  <div className="empty-state">
                    <FaHeartbeat className="empty-state-icon" style={{ color: 'var(--primary)' }} />
                    <h3>No active care plan suggested</h3>
                    <p>Once your dentist reviews your uploaded teeth scans, your suggested care plans and medications will appear here.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {myTreatedSubmissions.map(sub => (
                      <div className="workstation-card" key={sub._id} style={{ borderTop: '4px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
                          <h4 style={{ margin: 0 }}>Clinical Care Plan ({new Date(Number(sub._id) || Date.now()).toLocaleDateString()})</h4>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>Dentist: Dr. John Doe</span>
                        </div>

                        <div className="portal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          <div>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '16px' }}>
                              <FaClipboardList /> Care Instructions
                            </h4>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                              {sub.carePlan || 'Continue standard brushing and oral health routines.'}
                            </p>

                            {/* Checklist */}
                            {sub.carePlan && (
                              <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Checklist for Recovery</strong>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '8px' }}>
                                  <input type="checkbox" checked={!!careCheckboxes[sub._id + '_1']} onChange={() => toggleCareCheck(sub._id + '_1')} />
                                  <span style={{ textDecoration: careCheckboxes[sub._id + '_1'] ? 'line-through' : 'none', color: careCheckboxes[sub._id + '_1'] ? 'var(--text-light)' : 'inherit' }}>
                                    Followed dentist recommendations today
                                  </span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                  <input type="checkbox" checked={!!careCheckboxes[sub._id + '_2']} onChange={() => toggleCareCheck(sub._id + '_2')} />
                                  <span style={{ textDecoration: careCheckboxes[sub._id + '_2'] ? 'line-through' : 'none', color: careCheckboxes[sub._id + '_2'] ? 'var(--text-light)' : 'inherit' }}>
                                    Brushed twice and flossed
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', color: 'var(--info)', marginBottom: '16px' }}>
                              <FaPills /> Prescribed Medications
                            </h4>
                            {sub.medications ? (
                              <div style={{ backgroundColor: 'var(--info-light)', borderLeft: '4px solid var(--info)', padding: '20px', borderRadius: '8px' }}>
                                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#0891b2', marginBottom: '4px' }}>Medications List:</p>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                                  {sub.medications}
                                </p>
                              </div>
                            ) : (
                              <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No medications prescribed for this checkup.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: APPOINTMENTS */}
            {patientTab === 'appointments' && (
              <div className="appointments-pane" style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="appointments-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                  
                  {/* Left Column: My Upcoming Appointments */}
                  <div className="appt-list-column">
                    <div className="appt-card-header">
                      <h3>My Scheduled Sessions</h3>
                      <span className="appt-count-indicator">{myAppointments.length} Upcoming</span>
                    </div>

                    <div className="appt-scroll-list">
                      {myAppointments.length === 0 ? (
                        <div className="empty-state py-4">
                          <FaCalendarAlt className="empty-state-icon" style={{ color: '#94a3b8' }} />
                          <h4>No appointments scheduled</h4>
                          <p>Use the form to request a consultation slot with Dr. John Doe.</p>
                        </div>
                      ) : (
                        myAppointments.map(appt => (
                          <div className={`appointment-item status-${appt.status.toLowerCase()}`} key={appt._id}>
                            <div className="appt-time-box">
                              <FaClock />
                              <strong>{appt.time}</strong>
                            </div>

                            <div className="appt-patient-info">
                              <h5>Dentist: Dr. John Doe</h5>
                              <span className="id-badge">Location: Dental Clinic Cabin A</span>
                              <p className="appt-reason"><strong>Reason:</strong> {appt.reason}</p>
                            </div>

                            <div className="appt-actions-status">
                              <span className={`status-pill status-${appt.status.toLowerCase()}`}>
                                {appt.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Scheduling Form */}
                  <div className="appt-form-column">
                    <div className="scheduling-card">
                      <h3>Book New Appointment</h3>
                      <p className="instruction-text">Submit a time slot and clinical reason to book an appointment with Dr. John Doe.</p>
                      
                      <form onSubmit={handlePatientScheduleAppt} className="schedule-form">
                        <div className="form-group">
                          <label>Time Slot</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 02:30 PM Today / Tomorrow 10:00 AM" 
                            value={patientApptTime}
                            onChange={e => setPatientApptTime(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Reason for Appointment</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Toothache check, Routine Scaling, Alignment check" 
                            value={patientApptReason}
                            onChange={e => setPatientApptReason(e.target.value)}
                          />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                          Confirm Appointment Booking
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    );
  }

  // Admin page
  if (role === 'admin') {
    return (
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <FaTooth className="sidebar-logo" />
            <div className="brand-texts">
              <span className="brand-name">DENTIVA</span>
              <span className="brand-role">Clinic Admin</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button 
              className={`menu-item ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => { setActiveTab('pending'); setSelectedSubmission(null); }}
            >
              <FaTachometerAlt className="menu-icon" />
              <span>Pending Reviews</span>
              {pendingSubmissions.length > 0 && (
                <span className="badge badge-warning">{pendingSubmissions.length}</span>
              )}
            </button>

            <button 
              className={`menu-item ${activeTab === 'treated' ? 'active' : ''}`}
              onClick={() => { setActiveTab('treated'); setSelectedSubmission(null); }}
            >
              <FaHistory className="menu-icon" />
              <span>Treated Patients</span>
              {treatedPatients.length > 0 && (
                <span className="badge badge-success">{treatedPatients.length}</span>
              )}
            </button>

            <button 
              className={`menu-item ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => { setActiveTab('appointments'); setSelectedSubmission(null); }}
            >
              <FaCalendarAlt className="menu-icon" />
              <span>Today's Schedule</span>
              {appointments.filter(a => a.status !== 'Completed').length > 0 && (
                <span className="badge badge-info">
                  {appointments.filter(a => a.status !== 'Completed').length}
                </span>
              )}
            </button>

            <button 
              className={`menu-item ${activeTab === 'cases' ? 'active' : ''}`}
              onClick={() => { setActiveTab('cases'); setSelectedSubmission(null); }}
            >
              <FaBookMedical className="menu-icon" />
              <span>Patient Education</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="admin-profile">
              <FaUserCircle className="profile-avatar" />
              <div className="profile-details">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role">Dentist</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt style={{ marginRight: 8 }} /> Log Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main">
          {/* Quick Header Bar */}
          <header className="main-header">
            <div className="header-title">
              <h2>
                {activeTab === 'pending' && 'Pending Reviews'}
                {activeTab === 'treated' && 'Treated Patients'}
                {activeTab === 'appointments' && "Today's Appointment Schedule"}
                {activeTab === 'cases' && 'Clinical Case Library'}
              </h2>
              <p className="header-subtitle">
                {activeTab === 'pending' && 'Draw annotations and generate diagnoses reports'}
                {activeTab === 'treated' && 'View patients historical reports and treatment logs'}
                {activeTab === 'appointments' && 'Manage patients check-ins and appointments for today'}
                {activeTab === 'cases' && 'Interactive library of common dental conditions for patient chairside explanation'}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="quick-metrics">
              <div className="metric-box">
                <span className="metric-num">{pendingSubmissions.length}</span>
                <span className="metric-label">To Review</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">
                  {appointments.filter(a => a.status === 'Confirmed' || a.status === 'Active').length}
                </span>
                <span className="metric-label">Active Appts</span>
              </div>
              <div className="metric-box text-success">
                <span className="metric-num">{treatedPatients.length}</span>
                <span className="metric-label">Treated Today</span>
              </div>
            </div>
          </header>

          {/* Tab Screen Content */}
          <div className="content-body">
            
            {/* TAB: PENDING REVIEW */}
            {activeTab === 'pending' && (
              <div className="pending-pane">
                {!selectedSubmission ? (
                  <>
                    <div className="pane-header-actions" style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={fetchSubmissions}>Refresh</button>
                      <button className="btn btn-primary" onClick={() => setShowAddScanForm(!showAddScanForm)}>
                        <FaPlus /> {showAddScanForm ? 'Hide Form' : 'Register Walk-in Patient & Scan'}
                      </button>
                    </div>

                    {showAddScanForm && (
                      <div className="add-scan-card" style={{ marginBottom: '32px', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', animation: 'fadeIn 0.3s ease' }}>
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><FaPlus style={{ color: 'var(--primary)' }} /> Register New Patient & Upload Teeth Photo</h3>
                        <form onSubmit={handleAdminSubmitScan}>
                          <div className="form-row">
                            <div className="form-group">
                              <label><FaUser /> Patient Name</label>
                              <input type="text" placeholder="e.g. Alice Cooper" value={adminPatientName} onChange={e => setAdminPatientName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                              <label><FaUserInjured /> Patient ID</label>
                              <input type="text" placeholder="e.g. P1005" value={adminPatientId} onChange={e => setAdminPatientId(e.target.value)} required />
                            </div>
                          </div>
                          <div className="form-group">
                            <label><FaUserCircle /> Email Address</label>
                            <input type="email" placeholder="e.g. alice@example.com" value={adminPatientEmail} onChange={e => setAdminPatientEmail(e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label><FaBrush /> Clinical Observations / Symptoms</label>
                            <textarea placeholder="e.g., Pain in lower right molar, visible plaque, scaling needed." value={adminPatientNote} onChange={e => setAdminPatientNote(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label><FaTooth /> Upload Teeth Photo</label>
                            <div className="file-upload-wrapper">
                              <input type="file" className="input-file-hidden" onChange={e => setAdminPatientImage(e.target.files[0])} />
                              <div className="file-upload-display">
                                <FaImages className="upload-icon" />
                                <span>{adminPatientImage ? adminPatientImage.name : 'Select teeth scan image file...'}</span>
                              </div>
                            </div>
                          </div>
                          <button className="btn btn-primary" type="submit" disabled={adminSubmittingScan} style={{ marginTop: '12px' }}>
                            {adminSubmittingScan ? 'Registering...' : 'Register Patient & Upload Scan'}
                          </button>
                        </form>
                      </div>
                    )}

                    <div className="cards-grid">
                    {pendingSubmissions.length === 0 ? (
                      <div className="empty-state">
                        <FaCheckCircle className="empty-state-icon" style={{ color: '#10b981' }} />
                        <h3>All caught up!</h3>
                        <p>No pending teeth scans require diagnostic annotations at this moment.</p>
                        <button className="btn btn-secondary" onClick={fetchSubmissions}>Refresh</button>
                      </div>
                    ) : (
                      pendingSubmissions.map(sub => (
                        <div className="clinical-card" key={sub._id}>
                          <div className="card-top">
                            <span className="patient-badge">Patient Scan</span>
                            <span className="time-badge"><FaClock /> Pending</span>
                          </div>
                          
                          <div className="card-info">
                            <h4>{sub.name}</h4>
                            <div className="meta-row">
                              <span><strong>ID:</strong> {sub.patientId}</span>
                              <span>•</span>
                              <span><strong>Email:</strong> {sub.email}</span>
                            </div>
                            <p className="patient-symptom">
                              <strong>Symptoms:</strong> "{sub.note || 'No notes provided'}"
                            </p>
                          </div>

                          <div className="card-image-box">
                            <img 
                              src={sub.image ? sub.image || '' : ''} 
                              alt="Scan Preview" 
                              onError={handleImageError}
                            />
                          </div>

                          <button 
                            className="btn btn-primary btn-block"
                            onClick={() => {
                              setSelectedId(sub._id);
                              setSelectedSubmission(sub);
                              setReportUrl('');
                              setAdminCarePlan(sub.carePlan || '');
                              setAdminMedications(sub.medications || '');
                              setAiShapes([]);
                              setAiFindings('');
                            }}
                          >
                            <FaBrush style={{ marginRight: 8 }} /> Annotate & Diagnose
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  </>
                ) : (
                  /* Annotation Workstation Mode */
                  <div className="workstation-card">
                    <div className="workstation-header">
                      <button className="btn btn-sm btn-secondary" onClick={() => setSelectedSubmission(null)}>
                        ← Back to List
                      </button>
                      <div className="patient-summary-bubble">
                        <strong>Reviewing:</strong> {selectedSubmission.name} ({selectedSubmission.patientId})
                      </div>
                    </div>

                    {!aiFindings ? (
                      /* Mode A: Standard Workstation before AI Diagnosis */
                      <div className="workstation-grid">
                        <div className="canvas-column">
                          <div className="canvas-header-label">
                            <FaBrush style={{ marginRight: 6 }} /> Diagnostic Canvas
                            <span className="helper-label">(Use rectangle, circle, freehand, text, or brush overlays)</span>
                          </div>
                          <AnnotationCanvas
                            imageUrl={selectedSubmission.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400"><rect width="100" height="100" fill="%23ffffff"/><circle cx="50" cy="50" r="30" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><text x="50" y="55" font-family="sans-serif" font-size="5" text-anchor="middle" fill="%2364748b">No image uploaded. Use drawing tools to sketch layout.</text></svg>'}
                            onSave={savingAnnotation ? () => {} : annotate}
                            initialShapes={aiShapes}
                          />
                        </div>

                        <div className="diagnosis-column">
                          <h3><FaClipboardList style={{ marginRight: 6, color: '#3b82f6' }} /> Clinical Report</h3>
                          <p className="instruction-text">
                            Use the canvas toolbar to annotate findings on the teeth scan. Or run Google Gemini AI Auto-Diagnosis to generate automatic overlays and reports.
                          </p>

                          <div className="patient-notes-callout">
                            <strong>Patient's Symptoms Note:</strong>
                            <p>"{selectedSubmission.note || 'No notes provided'}"</p>
                          </div>

                          {/* Gemini AI Auto-Diagnosis Panel */}
                          <div className="gemini-ai-panel" style={{ border: '2px dashed #3b82f6', borderRadius: '12px', padding: '20px', backgroundColor: '#eff6ff', display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s ease', marginBottom: '16px' }}>
                            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8' }}>
                              🤖 Google Gemini Diagnostics
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Let Google Gemini review the teeth scan image, produce diagnosis notes, suggest a care plan, and dynamically plot visual annotations.
                            </p>
                            <button 
                              type="button" 
                              className="btn btn-primary" 
                              style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
                              onClick={handleAiDiagnose} 
                              disabled={aiDiagnosing}
                            >
                              {aiDiagnosing ? '🤖 Analyzing Scan...' : '🤖 Run AI Auto-Diagnosis'}
                            </button>
                          </div>

                          <div className="report-alert-info">
                            <h5>Standard Treatment Codes:</h5>
                            <ul>
                              <li><strong>Red Gums:</strong> Scaling recommended</li>
                              <li><strong>Crooked Teeth:</strong> Clear Aligners / Braces</li>
                              <li><strong>Receded Gums:</strong> Gum Surgery</li>
                              <li><strong>Stained Teeth:</strong> Prophylaxis & Polishing</li>
                              <li><strong>Worn Teeth:</strong> Night Guard / Filling</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Mode B: AI Diagnosis Results Workspace (Comparisons and Report) */
                      <div className="ai-comparison-workspace" style={{ animation: 'fadeIn 0.4s ease' }}>
                        {/* Title Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '24px' }}>
                          <FaCheckCircle style={{ color: 'var(--primary)', fontSize: '1.4rem' }} />
                          <div>
                            <strong style={{ display: 'block', fontSize: '1.05rem', color: '#1d4ed8' }}>Google Gemini Review Completed</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Real & Annotated scans shown side-by-side. Inspect overlays and complete report.</span>
                          </div>
                        </div>

                        {/* Images Side-by-side */}
                        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>1. Actual Image (Original Teeth Scan)</span>
                            <img 
                              src={selectedSubmission.image || ''} 
                              alt="Original scan" 
                              onError={handleImageError} 
                              style={{ width: '400px', height: '400px', objectFit: 'fill', borderRadius: '12px', border: '2px solid var(--border)', marginTop: '56px' }} 
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>2. AI Annotated Image (Interactive Workspace)</span>
                            <AnnotationCanvas
                              imageUrl={selectedSubmission.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400"><rect width="100" height="100" fill="%23ffffff"/><circle cx="50" cy="50" r="30" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><text x="50" y="55" font-family="sans-serif" font-size="5" text-anchor="middle" fill="%2364748b">No image uploaded. Use drawing tools to sketch layout.</text></svg>'}
                              onSave={savingAnnotation ? () => {} : annotate}
                              initialShapes={aiShapes}
                            />
                          </div>
                        </div>

                        {/* Reports Section (Observations and Editors) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                          {/* AI Diagnosis Report details */}
                          <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', marginBottom: '16px', fontSize: '1.2rem' }}>
                              🤖 Gemini AI Diagnosis Report
                            </h3>
                            <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '16px', marginBottom: '20px' }}>
                              <small style={{ color: 'var(--text-light)', display: 'block', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Visual Findings</small>
                              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{aiFindings}</p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div>
                                <small style={{ color: 'var(--text-light)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Suggested Guidelines</small>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{adminCarePlan}</span>
                              </div>
                              <div>
                                <small style={{ color: 'var(--text-light)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Recommended Medications</small>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{adminMedications}</span>
                              </div>
                            </div>
                          </div>

                          {/* Clinical Report Editor (Care Plan and Meds inputs) */}
                          <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              ✏️ Review & Customize Treatment
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              Modify the AI suggestions below or use the quick tags to build the prescription.
                            </p>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                Care Plan Guidelines
                              </label>
                              <textarea 
                                placeholder="Edit care plan guidelines..." 
                                value={adminCarePlan} 
                                onChange={e => setAdminCarePlan(e.target.value)} 
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--border)', fontSize: '0.85rem', minHeight: '80px', resize: 'vertical', lineHeight: '1.5', transition: 'border-color 0.2s', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                              />
                              <div style={{ marginTop: '8px' }}>
                                <small style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '6px' }}>Quick Recommendations (Click to Add, Click × to Remove):</small>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                  {careTags.map(tag => (
                                    <span 
                                      key={tag} 
                                      onClick={() => {
                                        setAdminCarePlan(prev => prev ? `${prev}\n■ ${tag}` : `■ ${tag}`);
                                      }}
                                      style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer', color: '#475569', transition: 'all 0.15s' }}
                                      onMouseOver={e => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#1d4ed8'; }}
                                      onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                                    >
                                      + {tag}
                                      <button 
                                        type="button" 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setCareTags(careTags.filter(t => t !== tag)); 
                                        }}
                                        style={{ border: 'none', background: 'none', color: '#ef4444', marginLeft: '6px', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 'bold' }}
                                      >
                                        &times;
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <input 
                                    type="text" 
                                    placeholder="+ Add custom recommendation option..." 
                                    value={newCareTag} 
                                    onChange={e => setNewCareTag(e.target.value)} 
                                    style={{ flex: 1, padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem', outline: 'none' }}
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newCareTag.trim()) {
                                          setCareTags([...careTags, newCareTag.trim()]);
                                          setNewCareTag('');
                                        }
                                      }
                                    }}
                                  />
                                  <button 
                                    type="button" 
                                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer', border: '1.5px solid #cbd5e1', backgroundColor: '#fff', color: '#475569' }}
                                    onClick={() => {
                                      if (newCareTag.trim()) {
                                        setCareTags([...careTags, newCareTag.trim()]);
                                        setNewCareTag('');
                                      }
                                    }}
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                Prescribed Medications
                              </label>
                              <textarea 
                                placeholder="Edit prescribed medications..." 
                                value={adminMedications} 
                                onChange={e => setAdminMedications(e.target.value)} 
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--border)', fontSize: '0.85rem', minHeight: '80px', resize: 'vertical', lineHeight: '1.5', transition: 'border-color 0.2s', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                              />
                              <div style={{ marginTop: '8px' }}>
                                <small style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '6px' }}>Quick Prescriptions (Click to Add, Click × to Remove):</small>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                  {medTags.map(tag => (
                                    <span 
                                      key={tag} 
                                      onClick={() => {
                                        setAdminMedications(prev => prev ? `${prev}\n■ ${tag}` : `■ ${tag}`);
                                      }}
                                      style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer', color: '#475569', transition: 'all 0.15s' }}
                                      onMouseOver={e => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#1d4ed8'; }}
                                      onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                                    >
                                      + {tag}
                                      <button 
                                        type="button" 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setMedTags(medTags.filter(t => t !== tag)); 
                                        }}
                                        style={{ border: 'none', background: 'none', color: '#ef4444', marginLeft: '6px', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 'bold' }}
                                      >
                                        &times;
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <input 
                                    type="text" 
                                    placeholder="+ Add custom medication option..." 
                                    value={newMedTag} 
                                    onChange={e => setNewMedTag(e.target.value)} 
                                    style={{ flex: 1, padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem', outline: 'none' }}
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newMedTag.trim()) {
                                          setMedTags([...medTags, newMedTag.trim()]);
                                          setNewMedTag('');
                                        }
                                      }
                                    }}
                                  />
                                  <button 
                                    type="button" 
                                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer', border: '1.5px solid #cbd5e1', backgroundColor: '#fff', color: '#475569' }}
                                    onClick={() => {
                                      if (newMedTag.trim()) {
                                        setMedTags([...medTags, newMedTag.trim()]);
                                        setNewMedTag('');
                                      }
                                    }}
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Help Banner indicating how to save */}
                            <div style={{ display: 'flex', gap: '10px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', padding: '12px' }}>
                              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                              <span style={{ fontSize: '0.8rem', color: '#b45309', lineHeight: '1.4' }}>
                                <strong>How to save:</strong> Make sure to click the <strong>"Save Annotation"</strong> button on the canvas toolbar to compile these recommendations into the official PDF report.
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                              <button 
                                className="btn btn-secondary" 
                                onClick={() => { setAiFindings(''); setAiShapes([]); }} 
                                style={{ flex: 1, padding: '12px', fontSize: '0.9rem', borderRadius: '10px' }}
                              >
                                Discard AI overlays
                              </button>
                            </div>

                            {reportUrl && (
                              <div className="success-report-download" style={{ margin: 0, padding: '16px', borderRadius: '12px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                                <FaCheckCircle className="check-success-icon" style={{ color: '#059669', marginRight: 10 }} />
                                <div>
                                  <h5 style={{ color: '#065f46', margin: '0 0 6px 0', fontSize: '0.95rem' }}>Report Generated Successfully!</h5>
                                  <a 
                                    className="btn btn-success btn-sm btn-inline" 
                                    href={reportUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ background: '#059669', borderColor: '#059669' }}
                                  >
                                    <FaFilePdf style={{ marginRight: 8 }} /> Download PDF Report
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: TREATED PATIENTS */}
            {activeTab === 'treated' && (
              <div className="treated-pane">
                <div className="search-bar-wrapper">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search treated patients by name, email, or patient ID..." 
                    value={treatedSearch}
                    onChange={e => setTreatedSearch(e.target.value)}
                  />
                </div>

                <div className="treated-list">
                  {filteredTreated.length === 0 ? (
                    <div className="empty-state">
                      <FaHistory className="empty-state-icon" style={{ color: '#94a3b8' }} />
                      <h3>No treated patients found</h3>
                      <p>{treatedSearch ? 'Try a different search query' : 'No patients have completed reports yet.'}</p>
                    </div>
                  ) : (
                    filteredTreated.map(patient => (
                      <div className="treated-patient-card" key={patient._id}>
                        <div className="treated-header">
                          <div className="patient-meta">
                            <h4>{patient.name}</h4>
                            <span className="id-sub-badge">ID: {patient.patientId}</span>
                            <span className="email-sub-text">{patient.email}</span>
                          </div>
                          <span className="status-badge-treated">Treated & Diagnosed</span>
                        </div>

                        <div className="treated-content-details">
                          <div className="treated-notes" style={{ flex: 1 }}>
                            <strong>Chief Complaint:</strong>
                            <p style={{ marginBottom: '12px' }}>"{patient.note || 'No notes provided'}"</p>
                            
                            {patient.carePlan && (
                              <div style={{ marginTop: '8px' }}>
                                <strong>Care Plan:</strong> <span style={{ color: 'var(--text-secondary)' }}>{patient.carePlan}</span>
                              </div>
                            )}
                            {patient.medications && (
                              <div style={{ marginTop: '4px' }}>
                                <strong>Medications:</strong> <span style={{ color: 'var(--text-secondary)' }}>{patient.medications}</span>
                              </div>
                            )}
                          </div>

                          {patient.image && (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginLeft: '20px', marginRight: '20px' }}>
                              <div style={{ textAlign: 'center' }}>
                                <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '2px' }}>Original</small>
                                <img 
                                  src={patient.image || ''} 
                                  alt="Original" 
                                  width={80} 
                                  style={{ borderRadius: '6px', border: '1px solid var(--border)' }}
                                  onError={handleImageError}
                                />
                              </div>
                              {patient.annotatedImage && (
                                <div style={{ textAlign: 'center' }}>
                                  <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '2px', fontWeight: 600 }}>Annotated</small>
                                  <img 
                                    src={patient.annotatedImage || ''} 
                                    alt="Annotated" 
                                    width={80} 
                                    style={{ borderRadius: '6px', border: '2px solid var(--primary)' }}
                                    onError={handleImageError}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="treated-report-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <a 
                              className="btn btn-secondary" 
                              href={`${API_BASE_URL}/api/report/${patient._id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <FaFilePdf style={{ marginRight: 8, color: '#ef4444' }} /> View PDF Diagnostics Report
                            </a>
                            <button 
                              className="btn btn-primary"
                              onClick={() => {
                                if (uploadingForPatientId === patient.patientId) {
                                  setUploadingForPatientId('');
                                } else {
                                  setUploadingForPatientId(patient.patientId);
                                  setPatientUploadImages([]);
                                  setPatientUploadNote('');
                                }
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              📷 Upload New Scan
                            </button>
                          </div>
                        </div>

                        {/* Inline Upload Scan Form */}
                        {uploadingForPatientId === patient.patientId && (
                          <form 
                            onSubmit={(e) => handlePatientCardUpload(e, patient)}
                            style={{ 
                              marginTop: '16px', 
                              borderTop: '1.5px dashed var(--border)', 
                              paddingTop: '16px', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '14px',
                              animation: 'fadeIn 0.3s ease'
                            }}
                          >
                            <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>📷 Add New Visit Scan for {patient.name}</h5>
                            
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Visit Symptoms / Notes
                              </label>
                              <textarea 
                                placeholder="e.g. Scaling follow-up. Patient complains of sensitivity in upper molars."
                                value={patientUploadNote}
                                onChange={e => setPatientUploadNote(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', minHeight: '60px' }}
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Upload Scan Files (Select Multiple)
                              </label>
                              <input 
                                type="file" 
                                accept="image/*"
                                multiple
                                onChange={e => setPatientUploadImages(Array.from(e.target.files))}
                                required
                                style={{ fontSize: '0.85rem' }}
                              />
                              {patientUploadImages.length > 0 && (
                                <div style={{ fontSize: '0.8rem', color: '#1d4ed8', marginTop: '6px', fontWeight: 500 }}>
                                  Selected {patientUploadImages.length} file(s): {patientUploadImages.map(f => f.name).join(', ')}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={isUploadingScan}
                                style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
                              >
                                {isUploadingScan ? 'Uploading...' : 'Submit New Scan'}
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => setUploadingForPatientId('')}
                                style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: TODAY'S SCHEDULE (APPOINTMENTS) */}
            {activeTab === 'appointments' && (
              <div className="appointments-pane">
                <div className="appointments-grid">
                  
                  {/* Left Column: Appointments List */}
                  <div className="appt-list-column">
                    <div className="appt-card-header">
                      <h3>Today's Schedule</h3>
                      <span className="appt-count-indicator">{appointments.length} Scheduled</span>
                    </div>

                    <div className="appt-scroll-list">
                      {appointments.length === 0 ? (
                        <div className="empty-state py-4">
                          <FaCalendarAlt className="empty-state-icon" style={{ color: '#94a3b8' }} />
                          <h4>No appointments scheduled today</h4>
                          <p>Use the form to book custom slots.</p>
                        </div>
                      ) : (
                        appointments.map(appt => (
                          <div 
                            className={`appointment-item status-${appt.status.toLowerCase()}`}
                            key={appt._id}
                          >
                            <div className="appt-time-box">
                              <FaClock />
                              <strong>{appt.time}</strong>
                            </div>

                            <div className="appt-patient-info">
                              <h5>{appt.name}</h5>
                              <span className="id-badge">ID: {appt.patientId}</span>
                              <p className="appt-reason"><strong>Reason:</strong> {appt.reason}</p>
                            </div>

                            <div className="appt-actions-status">
                              <span className={`status-pill status-${appt.status.toLowerCase()}`}>
                                {appt.status}
                              </span>

                              <div className="status-actions-buttons">
                                {appt.status !== 'Active' && appt.status !== 'Completed' && (
                                  <button 
                                    className="btn-status-action text-info"
                                    onClick={() => updateAppointmentStatus(appt._id, 'Active')}
                                    title="Set Active (In Chair)"
                                  >
                                    Start
                                  </button>
                                )}
                                {appt.status !== 'Completed' && (
                                  <button 
                                    className="btn-status-action text-success"
                                    onClick={() => updateAppointmentStatus(appt._id, 'Completed')}
                                    title="Mark Completed"
                                  >
                                    Finish
                                  </button>
                                )}
                                {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                                  <button 
                                    className="btn-status-action text-danger"
                                    onClick={() => updateAppointmentStatus(appt._id, 'Cancelled')}
                                    title="Cancel Appointment"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Schedule Form */}
                  <div className="appt-form-column">
                    <div className="scheduling-card">
                      <h3><FaPlus style={{ marginRight: 6 }} /> Book Appointment</h3>
                      <p className="instruction-text">Insert details to dynamically add a new appointment slot for today's clinic schedule.</p>
                      
                      <form onSubmit={createAppointment} className="schedule-form">
                        <div className="form-group">
                          <label>Patient Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Frank Sinatra" 
                            value={newApptName}
                            onChange={e => setNewApptName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Patient ID</label>
                          <input 
                            type="text" 
                            placeholder="e.g. P5012" 
                            value={newApptId}
                            onChange={e => setNewApptId(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Scheduled Time</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 03:30 PM" 
                            value={newApptTime}
                            onChange={e => setNewApptTime(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Reason for Visit</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Scaling / Braces Consultation" 
                            value={newApptReason}
                            onChange={e => setNewApptReason(e.target.value)}
                          />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                          Add Appointment
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: CLINICAL CASES (PATIENT EDUCATION) */}
            {activeTab === 'cases' && (
              <div className="cases-pane">
                <div className="cases-grid-layout">
                  {/* Left list of conditions */}
                  <div className="conditions-nav-column">
                    <h3>Dental Conditions</h3>
                    <p className="instruction-text">Select a clinical case to load talking points and details for patient consultations.</p>
                    
                    <div className="condition-buttons-list">
                      {CLINICAL_CASES.map(item => (
                        <button 
                          key={item.id}
                          className={`condition-select-btn ${selectedCase.id === item.id ? 'active' : ''}`}
                          onClick={() => setSelectedCase(item)}
                          style={{ borderLeft: `4px solid ${item.color}` }}
                        >
                          <div className="condition-btn-texts">
                            <strong>{item.title}</strong>
                            <span>{item.subtitle}</span>
                          </div>
                          <FaChevronRight className="nav-chevron" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right description detail pane */}
                  <div className="condition-detail-column" style={{ borderTop: `6px solid ${selectedCase.color}` }}>
                    <div className="detail-header">
                      <div className="title-section">
                        <h2>{selectedCase.title}</h2>
                        <span className="subtitle">{selectedCase.subtitle}</span>
                      </div>
                      <span className="severity-badge" style={{ backgroundColor: selectedCase.color + '22', color: selectedCase.color }}>
                        Severity: {selectedCase.severity}
                      </span>
                    </div>

                    <div className="detail-body">
                      <section className="detail-block">
                        <h4>Condition Overview</h4>
                        <p>{selectedCase.description}</p>
                      </section>

                      <div className="two-column-meta">
                        <section className="detail-block bg-light">
                          <h4>Key Symptoms</h4>
                          <ul>
                            {selectedCase.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </section>

                        <section className="detail-block bg-light">
                          <h4>Primary Causes</h4>
                          <ul>
                            {selectedCase.causes.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </section>
                      </div>

                      {/* Educational Script for Patients */}
                      <section className="detail-block patient-script-box">
                        <h4 style={{ color: selectedCase.color }}><FaInfoCircle /> Chairside Explanation Script</h4>
                        <p className="script-quote">{selectedCase.explanation}</p>
                        <span className="script-hint">(Read or explain this analogy to help the patient grasp the issue quickly)</span>
                      </section>

                      <section className="detail-block treatment-pathway">
                        <h4>Standard Treatment Path</h4>
                        <div className="treatment-bubble" style={{ borderLeft: `4px solid ${selectedCase.color}` }}>
                          {selectedCase.treatment}
                        </div>
                      </section>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default App;
