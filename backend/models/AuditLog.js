const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  recordId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  oldValue: Object,
  newValue: Object,
  source: String
}, { timestamps: true });

schema.pre('save', function(next) {
  if (!this.isNew) {
    next(new Error("Audit logs are immutable"));
  } else {
    next();
  }
});

module.exports = mongoose.model('AuditLog', schema);
