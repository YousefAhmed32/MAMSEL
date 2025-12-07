const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema({
  // Main product image - stores the URL path
  image: String,
  // Array of image objects with metadata
  images: [{
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  }],
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  salePrice: Number,
  totalStock: {
    type: Number,
    required: true
  },
  sold: {
    type: Number,
    default: 0,
    min: 0
  },
  size: String,
  fragranceType: String,
  // Clothes specific fields
  color: String,
  material: String,
  fit: String,
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Free sample eligibility
  isSampleEligible: {
    type: Boolean,
    default: false
  },
  sampleFree: {
    type: Boolean,
    default: false
  },
  sampleLimit: {
    type: Number,
    default: null // null means unlimited samples per user
  },
  // Attributes object for flexible product properties (e.g., sizes for clothes)
  attributes: {
    type: Object,
    default: {}
  },
  // Groups/Collections that this product belongs to
  groups: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
