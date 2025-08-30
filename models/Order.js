const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  image: String,
  description: String,
  category: String,
  currency: String,
  isAvailable: Boolean,
  quantity: Number,
});

const orderSchema = new mongoose.Schema({
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  shippingAddress: String,
  message: String,
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "delivered"],
    default: "pending",
  },
  paymentReference: String,
  paystackReference: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Order", orderSchema);
