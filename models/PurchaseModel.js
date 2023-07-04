const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  downloadLink: { type: String },
  expiresAt: { type: Date },
});

module.exports = mongoose.model('Purchase', purchaseSchema);
