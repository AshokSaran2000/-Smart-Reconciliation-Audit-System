const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { fork } = require('child_process');

const UploadJob = require('../../models/UploadJob');

const uploadDir = path.join(__dirname, '..', '..', 'uploads_files');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

router.post('/', auth, role('Admin','Analyst'), upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const fileBuffer = fs.readFileSync(filePath);
  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  try {
    const existing = await UploadJob.findOne({ fileHash });
    if (existing) return res.json({ jobId: existing._id, status: existing.status, reused: true });

    const job = await UploadJob.create({ fileName: req.file.originalname, fileHash, uploadedBy: req.user?.id, totalRecords: 0 });

    // spawn background processor
    const p = fork(path.join(__dirname, '..', 'processor.js'));
    p.send({ jobId: job._id.toString(), filePath, uploader: req.user?.id });

    res.json({ jobId: job._id, status: job.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/status/:id', async (req, res) => {
  try {
    const job = await UploadJob.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!job) return res.status(404).json({ message: 'Not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
