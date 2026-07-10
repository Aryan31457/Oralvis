try { require('dotenv').config(); } catch (e) { /* dotenv not needed in production */ }
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Ensure static_media directory exists
const staticMediaDir = path.join(__dirname, 'static_media');
if (!fs.existsSync(staticMediaDir)) {
  fs.mkdirSync(staticMediaDir, { recursive: true });
}

app.use('/static_media', express.static(staticMediaDir));

// In-memory DB
const users = [
  {
    email: 'admin@dentiva.com',
    password: 'adminpassword',
    name: 'Dr. John Doe',
    role: 'admin',
    isverified: true
  },
  {
    email: 'patient@dentiva.com',
    password: 'patientpassword',
    name: 'Jane Doe',
    role: 'patient',
    isverified: true
  }
];

const pendingSignups = new Map();
const submissions = [
  {
    _id: 'sub_1',
    name: 'David Miller',
    patientId: 'P2045',
    email: 'david@example.com',
    note: 'Looking to get braces. Need a preliminary check on my alignment.',
    image: '',
    status: 'uploaded',
    annotation: '',
    report: ''
  },
  {
    _id: 'sub_2',
    name: 'Sarah Jenkins',
    patientId: 'P3092',
    email: 'sarah.j@example.com',
    note: 'My gums bleed when brushing. Concerned about gingivitis.',
    image: '',
    status: 'uploaded',
    annotation: '',
    report: ''
  },
  {
    _id: 'sub_3',
    name: 'Alice Cooper',
    patientId: 'P1005',
    email: 'alice@example.com',
    note: 'Slight pain in upper molars when drinking cold water.',
    image: '',
    status: 'annotated',
    annotation: '[{"tool":"circle","color":"#d32f2f","thickness":3,"x":200,"y":180,"r":25}]',
    annotatedImage: '',
    report: 'report_sub_3.pdf',
    carePlan: 'Brush twice daily using desensitizing toothpaste. Avoid carbonated or highly acidic drinks for 2 weeks. Schedule follow-up in 3 months.',
    medications: 'Sensodyne Rapid Relief Toothpaste (use daily), Chlorhexidine mouthwash (rinse twice daily for 7 days)'
  }
];

const appointments = [
  {
    _id: 'appt_1',
    name: 'Jane Doe',
    patientId: 'P1002',
    time: '10:30 AM',
    reason: 'Routine Cleaning & Checkup',
    status: 'Confirmed'
  },
  {
    _id: 'appt_2',
    name: 'Robert Smith',
    patientId: 'P1024',
    time: '11:45 AM',
    reason: 'Severe Toothache / Extraction Consultation',
    status: 'Active'
  },
  {
    _id: 'appt_3',
    name: 'Emily Davis',
    patientId: 'P1055',
    time: '02:15 PM',
    reason: 'Braces Alignment Adjustment',
    status: 'Pending'
  },
  {
    _id: 'appt_4',
    name: 'Michael Miller',
    patientId: 'P1089',
    time: '04:00 PM',
    reason: 'Teeth Whitening & Polishing',
    status: 'Confirmed'
  }
];

const upload = multer({ storage: multer.memoryStorage() });
const pdfStore = {}; // In-memory PDF storage { submissionId: Buffer }

// Auth: Signup
app.post('/api/signup', (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Generate 6-digit OTP
  const otp = '123456';
  pendingSignups.set(email, {
    email,
    password,
    name,
    role: role === 'admin' ? 'admin' : 'patient', // map 'user' role from dropdown to 'patient'
    otp
  });

  console.log(`[MOCK OTP] Sent OTP code "${otp}" to ${email}`);
  return res.json({ success: true, message: 'OTP sent to email. Code is 123456.' });
});

// Auth: Verify Email
app.post('/api/verifyemail', (req, res) => {
  const { email, verificationcode } = req.body;
  const pending = pendingSignups.get(email);
  if (!pending) {
    return res.status(400).json({ message: 'No signup in progress for this email.' });
  }

  if (pending.otp === verificationcode) {
    users.push({
      email: pending.email,
      password: pending.password,
      name: pending.name,
      role: pending.role,
      isverified: true
    });
    pendingSignups.delete(email);
    return res.json({ success: true, message: 'Email verified successfully.' });
  } else {
    return res.status(400).json({ message: 'Invalid verification code.' });
  }
});

// Auth: Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }

  if (user.password !== password) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }

  if (!user.isverified) {
    return res.status(400).json({ message: 'Email is not verified.' });
  }

  const token = jwt.sign({ email: user.email, role: user.role }, 'mock_secret_key');
  return res.json({
    success: true,
    token,
    user: {
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// Patient & Admin: Submit one or multiple teeth photos
app.post('/api/submit', upload.any(), (req, res) => {
  const { name, patientId, email, note } = req.body;
  
  if (!req.files || req.files.length === 0) {
    const submission = {
      _id: Date.now().toString(),
      name,
      patientId,
      email,
      note: note || '',
      image: '',
      status: 'uploaded',
      annotation: '',
      report: ''
    };
    submissions.unshift(submission);
    return res.json({ success: true, submissions: [submission] });
  }

  const newSubmissions = req.files.map((file, index) => {
    const mimeType = file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${file.buffer.toString('base64')}`;
    return {
      _id: (Date.now() + index).toString(),
      name,
      patientId,
      email,
      note: note || '',
      image: dataUrl,  // stored as base64 data URL in memory
      status: 'uploaded',
      annotation: '',
      report: ''
    };
  });

  submissions.unshift(...newSubmissions);
  res.json({ success: true, submissions: newSubmissions });
});

// Admin: Get submissions
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Appointments: Get
app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

// Appointments: Create
app.post('/api/appointments', (req, res) => {
  const { name, patientId, time, reason } = req.body;
  if (!name || !patientId || !time) {
    return res.status(400).json({ message: 'Name, Patient ID and Time are required' });
  }
  const appt = {
    _id: Date.now().toString(),
    name,
    patientId,
    time,
    reason: reason || 'General Consultation',
    status: 'Confirmed'
  };
  appointments.push(appt);
  res.json({ success: true, appointment: appt });
});

// Appointments: Update Status
app.post('/api/appointments/:id/status', (req, res) => {
  const { status } = req.body;
  const appt = appointments.find(a => a._id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Not found' });
  appt.status = status;
  res.json({ success: true, appointment: appt });
});

// Admin: Annotate image and generate PDF
app.post('/api/annotate/:id', (req, res) => {
  const { annotation, annotatedImage, carePlan, medications } = req.body;
  const submission = submissions.find(s => s._id === req.params.id);
  if (!submission) return res.status(404).json({ error: 'Not found' });
  submission.annotation = annotation;
  submission.status = 'annotated';
  submission.carePlan = carePlan || '';
  submission.medications = medications || '';

  // Store annotated image as base64 data URL in memory (no disk write needed)
  if (annotatedImage) {
    submission.annotatedImage = annotatedImage;
  }

  // Generate PDF report in memory
  const doc = new PDFDocument();
  const pdfFilename = `report_${submission._id}.pdf`;
  const pdfChunks = [];
  doc.on('data', chunk => pdfChunks.push(chunk));
  doc.on('end', () => { pdfStore[submission._id] = Buffer.concat(pdfChunks); });

  // Title
  doc.fontSize(24).fillColor('#1976d2').text('Dentiva Report', { align: 'center' });
  doc.moveDown(1.5);

  // Patient Details
  doc.fontSize(14).fillColor('#333').text(`Name: ${submission.name}`);
  doc.text(`Patient ID: ${submission.patientId}`);
  doc.text(`Email: ${submission.email}`);
  doc.text(`Note: ${submission.note}`);
  doc.moveDown();

  // Images Section
  if (submission.image && submission.image.startsWith('data:')) {
    doc.fontSize(16).fillColor('#1976d2').text('Original Image', { align: 'center' });
    doc.moveDown(0.5);
    try {
      const imgBuf = Buffer.from(submission.image.replace(/^data:[^;]+;base64,/, ''), 'base64');
      doc.image(imgBuf, { fit: [300, 200], align: 'center', valign: 'center' });
    } catch (e) {
      console.error('Error adding original image to PDF', e);
    }
    doc.moveDown();
  }
  if (submission.annotatedImage && submission.annotatedImage.startsWith('data:')) {
    doc.fontSize(16).fillColor('#1976d2').text('Annotated Image', { align: 'center' });
    doc.moveDown(0.5);
    try {
      const annBuf = Buffer.from(submission.annotatedImage.replace(/^data:[^;]+;base64,/, ''), 'base64');
      doc.image(annBuf, { fit: [300, 200], align: 'center', valign: 'center' });
    } catch (e) {
      console.error('Error adding annotated image to PDF', e);
    }
    doc.moveDown();
  }

  // Annotation Section
  doc.fontSize(14).fillColor('#333').text('Annotation:', { underline: true });
  doc.text(annotation);
  doc.moveDown();

  // Treatment Recommendations Table
  doc.fontSize(16).fillColor('#1976d2').text('TREATMENT RECOMMENDATIONS:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#333');
  doc.text('■ Inflammed or Red gums : Scaling.', { continued: true }).fillColor('#800000').text('');
  doc.fillColor('#333').text('■ Malaligned : Braces or Clear Aligner.', { continued: true }).fillColor('#FFD600').text('');
  doc.fillColor('#333').text('■ Receded gums : Gum Surgery.', { continued: true }).fillColor('#8D6E63').text('');
  doc.fillColor('#333').text('■ Stains : Teeth cleaning and polishing.', { continued: true }).fillColor('#D32F2F').text('');
  doc.fillColor('#333').text('■ Attrition : Filling/ Night Guard.', { continued: true }).fillColor('#00BCD4').text('');
  doc.fillColor('#333').text('■ Crowns : If the crown is loose or broken, better get it checked. Teeth coloured caps are the best ones.', { continued: true }).fillColor('#E91E63').text('');
  doc.moveDown();

  if (submission.carePlan) {
    doc.fontSize(16).fillColor('#1976d2').text('SUGGESTED CARE PLAN:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333').text(submission.carePlan);
    doc.moveDown();
  }

  if (submission.medications) {
    doc.fontSize(16).fillColor('#1976d2').text('RECOMMENDED MEDICATIONS:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333').text(submission.medications);
    doc.moveDown();
  }

  doc.end();
  submission.report = pdfFilename;
  res.json({ success: true, report: submission.report });
});

// Serve PDF from in-memory store
app.get('/api/report/:id', (req, res) => {
  const submission = submissions.find(s => s._id === req.params.id);
  if (!submission || !submission.report) return res.status(404).json({ error: 'Not found' });
  const pdfBuffer = pdfStore[submission._id];
  if (!pdfBuffer) return res.status(404).json({ error: 'PDF not yet generated' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${submission.report}"`);
  res.send(pdfBuffer);
});

// Helper to extract mime type from a base64 data URL
function getMimeTypeFromDataUrl(dataUrl) {
  const match = dataUrl && dataUrl.match(/^data:([^;]+);base64,/);
  return match ? match[1] : 'image/jpeg';
}

// Admin: AI Auto-Diagnose using Google Gemini
app.post('/api/submissions/:id/ai-diagnose', async (req, res) => {
  const submission = submissions.find(s => s._id === req.params.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const hasImageFile = submission.image && submission.image.startsWith('data:');

  if (!hasImageFile) {
    let findings = "AI detected potential issues based on patient symptoms. Visual inspection indicates mild plaque accumulation.";
    let carePlan = "Brush twice daily. Use dental floss daily. Schedule a routine cleanup.";
    let medications = "Mouthwash (once daily).";
    let shapes = [];

    const noteLower = (submission.note || '').toLowerCase();
    if (noteLower.includes('bleed') || noteLower.includes('gum')) {
      findings = "Potential Gingivitis detected. Gums appear slightly inflamed or reddish near the gumline.";
      carePlan = "Warm salt water rinses twice daily. Brush gently with a soft-bristled toothbrush. Schedule Scaling & Polishing.";
      medications = "Chlorhexidine mouthwash 0.2% (10ml twice daily for 7 days).";
      shapes = [
        { tool: 'circle', color: '#d32f2f', thickness: 3, x: 180, y: 170, r: 20 },
        { tool: 'circle', color: '#d32f2f', thickness: 3, x: 220, y: 170, r: 20 }
      ];
    } else if (noteLower.includes('brace') || noteLower.includes('align') || noteLower.includes('crooked')) {
      findings = "Moderate Malocclusion (crowding) observed in the anterior teeth region.";
      carePlan = "Orthodontic consultation recommended. Maintain excellent oral hygiene between teeth.";
      medications = "No medications required. Recommended: Dental flosser or waterpik.";
      shapes = [
        { tool: 'rectangle', color: '#ff9800', thickness: 3, x: 120, y: 185, w: 160, h: 30 }
      ];
    } else if (noteLower.includes('pain') || noteLower.includes('toothache') || noteLower.includes('cavity') || noteLower.includes('decay')) {
      findings = "Potential dental caries (cavity) located in the upper molars. Exposed dentin may be causing temperature sensitivity.";
      carePlan = "Avoid extremely cold or hot beverages. Maintain brushing with desensitizing toothpaste. Schedule a dental filling.";
      medications = "Sensodyne Rapid Relief (daily brushing), Paracetamol 500mg (as needed for pain).";
      shapes = [
        { tool: 'circle', color: '#d32f2f', thickness: 3, x: 160, y: 200, r: 18 }
      ];
    }

    return res.json({
      success: true,
      findings,
      carePlan,
      medications,
      shapes
    });
  }

  try {
    const base64Data = submission.image.replace(/^data:[^;]+;base64,/, '');
    const detectedMimeType = getMimeTypeFromDataUrl(submission.image);
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert dental diagnostics AI. Analyze this teeth scan image and the patient's symptoms note: "${submission.note || 'No notes provided'}".
              Provide a professional dental diagnostics report.
              
              CRITICAL ANNOTATION RULES (MUST FOLLOW):
              1. CONFIDENCE RULE: Only annotate and generate shapes for anomalies (like caries, decay, severe plaque, or inflammation) that you are HIGHLY CONFIDENT about. If you are unsure or not fully confident, do NOT return any shape coordinates for it.
              2. TEETH ONLY RULE: All shape coordinates MUST land strictly on the hard enamel of the teeth (white/yellow/brown tooth structures) or the immediate gingival margin (gumline).
              3. TONGUE EXCLUSION RULE: NEVER place annotations on the tongue, lips, cheeks, throat, or chin. The tongue lies in the center behind the teeth and is soft red/pink flesh. Check your coordinates carefully: verify that your annotations do NOT overlap the tongue space.
              4. COORDINATE LIMITS:
                 - The canvas grid is 400x400 (x from 0 to 400, y from 0 to 400).
                 - Restrict all shape center y-coordinates strictly to the vertical band of the teeth, between y=150 and y=250.
                 - Double-check your output: do NOT return any shape where y < 145 or y > 255.
              
              You MUST return the response ONLY as a valid JSON object matching the following structure:
              {
                "findings": "A clear description of visual observations, e.g., inflamed gums, suspected caries, or stains.",
                "carePlan": "Specific, actionable home care instructions.",
                "medications": "Recommended medications (mouthwash, toothpaste, or pain relievers) if applicable, otherwise 'None prescribed'.",
                "shapes": [
                  {
                    "tool": "circle",
                    "color": "#d32f2f", 
                    "thickness": 3,
                    "x": 200, // center x of anomaly on a 400x400 canvas (0-400)
                    "y": 200, // center y of anomaly on a 400x400 canvas (0-400). Must be strictly between 150 and 250!
                    "r": 20   // radius (10-30)
                  }
                ]
              }
              Note: The "shapes" array should contain coordinates indicating regions of interest on a 400x400 canvas size. Use "circle" (with x, y, r) or "rectangle" (with x, y, w, h). Keep coordinates between 20 and 380. Return ONLY the JSON object, no markdown formatting block, no other text.`
            },
            {
              inlineData: {
                mimeType: detectedMimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Gemini raw response:", resultText);

    let parsedResult = {
      findings: "Unable to parse AI response. Plaque build-up under review.",
      carePlan: "Standard brushing and flossing recommended.",
      medications: "None prescribed.",
      shapes: []
    };

    if (resultText) {
      try {
        const cleanJson = resultText.replace(/```json|```/g, '').trim();
        parsedResult = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.error("Error parsing Gemini JSON:", parseErr);
        parsedResult.findings = resultText.slice(0, 500);
      }
    }

    res.json({
      success: true,
      findings: parsedResult.findings,
      carePlan: parsedResult.carePlan,
      medications: parsedResult.medications,
      shapes: parsedResult.shapes || []
    });

  } catch (err) {
    console.error("Gemini API call failed:", err.message);
    res.status(500).json({ error: "AI Diagnostics failed. Please try manual annotation." });
  }
});

function ensureMockData() {
  // Generate mock PDF for alice's pre-seeded submission (sub_3) in memory
  if (!pdfStore['sub_3']) {
    try {
      const doc = new PDFDocument();
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => { pdfStore['sub_3'] = Buffer.concat(chunks); console.log('Mock report for sub_3 generated in memory.'); });
      doc.fontSize(24).fillColor('#1976d2').text('Dentiva Report', { align: 'center' });
      doc.moveDown(1.5);
      doc.fontSize(14).fillColor('#333').text('Name: Alice Cooper');
      doc.text('Patient ID: P1005');
      doc.text('Email: alice@example.com');
      doc.text('Note: Slight pain in upper molars when drinking cold water.');
      doc.moveDown();
      doc.fontSize(16).fillColor('#1976d2').text('TREATMENT RECOMMENDATIONS:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#333');
      doc.text('■ Inflammed or Red gums : Scaling.', { continued: true }).fillColor('#800000').text('');
      doc.moveDown();
      doc.fontSize(16).fillColor('#1976d2').text('SUGGESTED CARE PLAN:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#333').text('Brush twice daily using desensitizing toothpaste. Avoid carbonated or highly acidic drinks for 2 weeks. Schedule follow-up in 3 months.');
      doc.moveDown();
      doc.fontSize(16).fillColor('#1976d2').text('RECOMMENDED MEDICATIONS:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#333').text('Sensodyne Rapid Relief Toothpaste (use daily), Chlorhexidine mouthwash (rinse twice daily for 7 days)');
      doc.end();
    } catch (err) {
      console.error('Failed to generate mock report:', err);
    }
  }
}

// Serve frontend static build files
const frontendBuildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuildPath));

// SPA fallback routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/static_media')) {
    return next();
  }
  const indexFile = path.join(frontendBuildPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.send('Backend is running. (Note: Frontend build was not found. Run "npm run build" in the frontend directory to compile the React assets.)');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  ensureMockData();
  console.log(`Backend running on port ${PORT}`);
});
