const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  customizations: {
    type: [
      {
        name: String,
        selectedOption: {
          label: String,
          price: Number,
        },
      },
    ],
    default: [],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: subtotal (sum of item price * qty)
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// Virtual: deliveryFee
cartSchema.virtual('deliveryFee').get(function () {
  const sub = this.subtotal;
  if (sub === 0) return 0;
  return sub >= 500 ? 0 : 49;
});

// Virtual: tax (5% GST)
cartSchema.virtual('tax').get(function () {
  return Math.round(this.subtotal * 0.05 * 100) / 100;
});

// Virtual: total
cartSchema.virtual('total').get(function () {
  return Math.max(
    0,
    Math.round(
      (this.subtotal + this.deliveryFee + this.tax - this.couponDiscount) * 100
    ) / 100
  );
});

module.exports = mongoose.model('Cart', cartSchema);
