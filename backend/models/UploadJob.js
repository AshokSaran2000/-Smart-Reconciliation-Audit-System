const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  fileName: String,
  fileHash: { type: String, unique: true },
  status: {
    type: String,
    enum: ['Processing','Completed','Failed'],
    default: 'Processing'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalRecords: Number
}, { timestamps: true });

module.exports = mongoose.model('UploadJob', schema);
