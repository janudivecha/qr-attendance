const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  qrCode: String,
  present: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
