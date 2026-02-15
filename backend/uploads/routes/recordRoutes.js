const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const Record = require('../../models/Record');
const ReconciliationResult = require('../../models/ReconciliationResult');
const AuditLog = require('../../models/AuditLog');

router.get('/:id', auth, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Not found' });
    const result = await ReconciliationResult.findOne({ recordId: record._id });
    const timeline = await AuditLog.find({ recordId: record._id }).sort({ createdAt: -1 });
    res.json({ record, result, timeline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { status, uploadJobId, limit = 50, offset = 0 } = req.query;
    const q = {};
    if (uploadJobId) q.uploadJobId = uploadJobId;
    const records = await Record.find(q).skip(Number(offset)).limit(Number(limit));
    // attach reconciliation status
    const ids = records.map(r => r._id);
    const results = await ReconciliationResult.find({ recordId: { $in: ids } });
    const byId = new Map(results.map(r => [String(r.recordId), r]));
    const out = records.map(r => ({ record: r, result: byId.get(String(r._id)) }));
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manual correction endpoint - Admin and Analyst only
router.patch('/:id/correct', auth, role('Admin','Analyst'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // e.g., { amount: 123.45, transactionId: 'X' }
    const record = await Record.findById(id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const oldValue = record.toObject();
    Object.assign(record, updates);
    await record.save();

    // write audit log
    await AuditLog.create({ recordId: record._id, userId: req.user?.id || null, oldValue, newValue: record.toObject(), source: 'manual-correction' });

    // recompute reconciliation result (simple: set to 'Matched' if exact match, else 'Partially Matched')
    const sys = await require('../../models/SystemRecord').findOne({ transactionId: record.transactionId });
    let status = 'Not Matched';
    let mismatchFields = [];
    if (sys && sys.amount === record.amount) status = 'Matched';
    else if (sys) { status = 'Partially Matched'; if (sys.amount !== record.amount) mismatchFields.push('amount'); if (sys.transactionId !== record.transactionId) mismatchFields.push('transactionId'); }

    await ReconciliationResult.findOneAndUpdate({ recordId: record._id }, { status, mismatchFields }, { upsert: true });

    res.json({ record, status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
