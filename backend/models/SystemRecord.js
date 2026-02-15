const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  transactionId: { type: String, index: true },
  amount: Number,
  referenceNumber: { type: String, index: true },
  date: Date,
  metadata: Object
}, { timestamps: true });

module.exports = mongoose.model('SystemRecord', schema);
