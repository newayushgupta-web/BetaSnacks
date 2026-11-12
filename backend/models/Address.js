const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true, default: '' },
    isDefault: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
