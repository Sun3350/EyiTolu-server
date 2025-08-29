// backend/src/controllers/galleryController.js
const GalleryItem = require("../models/Gallery");
const { cloudinary } = require("../config/cloudinaryConfig");

class GalleryController {
  // Upload media to gallery
  static async uploadMedia(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { filter = "normal" } = req.body;
      const type = req.file.mimetype.startsWith("image/") ? "image" : "video";

      // Get file info from Cloudinary
      const fileInfo = await cloudinary.api.resource(req.file.filename, {
        resource_type: type,
      });

      const galleryItem = new GalleryItem({
        type,
        publicId: req.file.filename,
        url: req.file.path,
        originalName: req.file.originalname,
        filter,
        format: fileInfo.format,
        bytes: fileInfo.bytes,
        width: fileInfo.width,
        height: fileInfo.height,
      });

      await galleryItem.save();

      res.status(201).json({
        message: "File uploaded successfully",
        item: galleryItem.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all gallery items
  static async getGallery(req, res, next) {
    try {
      const items = await GalleryItem.find().sort({ createdAt: -1 });
      res.json({
        items: items.map((item) => item.toJSON()),
        count: items.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single gallery item
  static async getGalleryItem(req, res, next) {
    try {
      const { id } = req.params;
      const item = await GalleryItem.findById(id);

      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(item.toJSON());
    } catch (error) {
      next(error);
    }
  }

  // Delete gallery item
  static async deleteGalleryItem(req, res, next) {
    try {
      const { id } = req.params;
      const item = await GalleryItem.findById(id);

      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(item.publicId, {
        resource_type: item.type,
      });

      // Delete from database
      await GalleryItem.findByIdAndDelete(id);

      res.json({
        message: "Item deleted successfully",
        deletedItem: item.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Clear all gallery items (for testing)
  static async clearGallery(req, res, next) {
    try {
      const items = await GalleryItem.find();

      // Delete all files from Cloudinary
      for (const item of items) {
        try {
          await cloudinary.uploader.destroy(item.publicId, {
            resource_type: item.type,
          });
        } catch (cloudinaryError) {
          console.warn(
            "Could not delete from Cloudinary:",
            cloudinaryError.message
          );
        }
      }

      // Clear database
      await GalleryItem.deleteMany({});

      res.json({
        message: "Gallery cleared successfully",
        deletedCount: items.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GalleryController;
