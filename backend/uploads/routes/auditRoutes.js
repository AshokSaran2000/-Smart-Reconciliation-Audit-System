const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const AuditLog = require('../../models/AuditLog');

// Get all audit logs
router.get('/logs', auth, async (req, res) => {
  try {
    const { recordId, userId, source, limit = 100, offset = 0 } = req.query;
    const query = {};
    
    if (recordId) query.recordId = recordId;
    if (userId) query.userId = userId;
    if (source) query.source = source;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .exec();

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get audit logs for a specific record
router.get('/record/:recordId', auth, async (req, res) => {
  try {
    const logs = await AuditLog.find({ recordId: req.params.recordId })
      .sort({ createdAt: -1 })
      .exec();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get audit summary stats
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await AuditLog.countDocuments();
    const bySource = await AuditLog.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await AuditLog.countDocuments({
      createdAt: { $gte: today }
    });

    res.json({ total, bySource, todayCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
