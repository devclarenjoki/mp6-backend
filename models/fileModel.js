const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  path: { type: String, required: true },
  // Add any other relevant fields for the file
});

module.exports = mongoose.model('File', fileSchema);
