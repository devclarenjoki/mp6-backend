const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['music', 'video'] },
  tags: [{ type: String }],
  price: { type: Number, required: true },
  ratings:{type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  fileUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Product', productSchema);
