const express = require('express');
// const mongoose = require('mongoose'); // Uncomment to use MongoDB
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/static_media', express.static(path.join(__dirname, 'static_media')));

// mongoose.connect('mongodb://localhost:27017/oralvis', { useNewUrlParser: true, useUnifiedTopology: true }); // Uncomment to use MongoDB



// In-memory submissions array for prototype
const submissions = [];

const upload = multer({ dest: 'static_media/' });
// ...existing code...

// Patient upload
app.post('/api/submit', upload.single('image'), (req, res) => {
  const { name, patientId, email, note } = req.body;
  const image = req.file ? req.file.filename : '';
  const submission = {
    _id: Date.now().toString(),
    name,
    patientId,
    email,
    note,
    image,
    status: 'uploaded',
    annotation: '',
    report: ''
  };
  submissions.push(submission);
  res.json({ success: true });
});

// Admin: get submissions
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Admin: annotate and generate PDF
app.post('/api/annotate/:id', (req, res) => {
  const { annotation, annotatedImage } = req.body;
  const submission = submissions.find(s => s._id === req.params.id);
  if (!submission) return res.status(404).json({ error: 'Not found' });
  submission.annotation = annotation;
  submission.status = 'annotated';

  // Save annotated image (base64 PNG)
  if (annotatedImage) {
    try {
      const base64Data = annotatedImage.replace(/^data:image\/png;base64,/, "");
      const annotatedPath = `static_media/annotated_${submission._id}.png`;
      fs.writeFileSync(annotatedPath, base64Data, 'base64');
      submission.annotatedImage = `annotated_${submission._id}.png`;
    } catch (err) {
      console.error('Error saving annotated image:', err);
    }
  }

  // Generate PDF in the requested format
  const doc = new PDFDocument();
  const pdfPath = `static_media/report_${submission._id}.pdf`;
  doc.pipe(fs.createWriteStream(pdfPath));

  // Title
  doc.fontSize(24).fillColor('#1976d2').text('Oralvis Report', { align: 'center' });
  doc.moveDown(1.5);

  // Patient Details
  doc.fontSize(14).fillColor('#333').text(`Name: ${submission.name}`);
  doc.text(`Patient ID: ${submission.patientId}`);
  doc.text(`Email: ${submission.email}`);
  doc.text(`Note: ${submission.note}`);
  doc.moveDown();

  // Images Section
  if (submission.image) {
    doc.fontSize(16).fillColor('#1976d2').text('Original Image', { align: 'center' });
    doc.moveDown(0.5);
    doc.image(path.join(__dirname, 'static_media', submission.image), {
      fit: [300, 200],
      align: 'center',
      valign: 'center'
    });
    doc.moveDown();
  }
  if (submission.annotatedImage) {
    doc.fontSize(16).fillColor('#1976d2').text('Annotated Image', { align: 'center' });
    doc.moveDown(0.5);
    doc.image(path.join(__dirname, 'static_media', submission.annotatedImage), {
      fit: [300, 200],
      align: 'center',
      valign: 'center'
    });
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

  doc.end();
  submission.report = `report_${submission._id}.pdf`;
  res.json({ success: true, report: submission.report });
});

// Serve PDF
app.get('/api/report/:id', (req, res) => {
  const submission = submissions.find(s => s._id === req.params.id);
  if (!submission || !submission.report) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'static_media', submission.report));
});

// ...existing code...

app.listen(5000, () => console.log('Backend running on port 5000'));
