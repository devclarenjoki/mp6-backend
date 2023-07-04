const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
