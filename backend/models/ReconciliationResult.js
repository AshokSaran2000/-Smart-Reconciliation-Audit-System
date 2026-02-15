const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
  status: {
    type: String,
    enum: ['Matched','Partially Matched','Not Matched','Duplicate']
  },
  mismatchFields: [String]
}, { timestamps: true });

module.exports = mongoose.model('ReconciliationResult', schema);
