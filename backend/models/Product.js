const mongoose = require('mongoose');

const customizationOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
});

const customizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  options: [customizationOptionSchema],
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot', 'extra-hot'],
      default: 'mild',
    },
    preparationTime: {
      type: Number,
      default: 20,
      comment: 'in minutes',
    },
    calories: {
      type: Number,
      default: 0,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    customizations: {
      type: [customizationSchema],
      default: [],
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Indexes for search/filter performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestseller: 1 });
productSchema.index({ isSpecial: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ sold: -1 });

module.exports = mongoose.model('Product', productSchema);
