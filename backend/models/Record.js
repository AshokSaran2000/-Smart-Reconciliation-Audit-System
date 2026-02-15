const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  uploadJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadJob',
    index: true
  },
  transactionId: { type: String, index: true },
  amount: Number,
  referenceNumber: { type: String, index: true },
  date: Date,
  rawData: Object
}, { timestamps: true });

module.exports = mongoose.model('Record', schema);


