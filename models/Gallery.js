// backend/src/models/Gallery.js
const mongoose = require("mongoose");

const galleryItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filter: {
      type: String,
      default: "normal",
    },
    format: {
      type: String,
      required: true,
    },
    bytes: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: false,
    },
    height: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add virtual for createdAt in ISO format
galleryItemSchema.virtual("createdAtISO").get(function () {
  return this.createdAt.toISOString();
});

// Ensure virtual fields are serialized
galleryItemSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    ret.createdAt = ret.createdAtISO;
    delete ret._id;
    delete ret.__v;
    delete ret.createdAtISO;
    return ret;
  },
});

module.exports = mongoose.model("GalleryItem", galleryItemSchema);
