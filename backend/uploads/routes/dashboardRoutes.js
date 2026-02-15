const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const UploadJob = require('../../models/UploadJob');
const Record = require('../../models/Record');
const ReconciliationResult = require('../../models/ReconciliationResult');

router.get('/summary', auth, async (req, res) => {
  try {
    const { from, to, uploadedBy } = req.query;
    const match = {};
    if (from || to) match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
    if (uploadedBy) match.uploadedBy = uploadedBy;

    const totalUploads = await UploadJob.countDocuments(match);
    const totalRecords = await Record.countDocuments(match.uploadJobId ? { uploadJobId: match.uploadJobId } : {});

    const matched = await ReconciliationResult.countDocuments({ status: 'Matched' });
    const partially = await ReconciliationResult.countDocuments({ status: 'Partially Matched' });
    const notMatched = await ReconciliationResult.countDocuments({ status: 'Not Matched' });
    const duplicates = await ReconciliationResult.countDocuments({ status: 'Duplicate' });

    const accuracy = matched + partially + notMatched ? Math.round((matched / (matched + partially + notMatched + duplicates)) * 100) : 0;

    res.json({ totalUploads, totalRecords, matched, partially, notMatched, duplicates, accuracy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/recent', auth, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const jobs = await UploadJob.find({}).sort({ createdAt: -1 }).limit(limit).populate('uploadedBy', 'name email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
