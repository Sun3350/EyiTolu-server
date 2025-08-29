// backend/src/routes/galleryRoutes.js
const express = require("express");
const router = express.Router(); // Use Express's built-in router
const upload = require("../config/multerConfig");
const GalleryController = require("../controllers/galleryController");

// POST /api/gallery/upload - Upload media
router.post("/upload", upload.single("file"), GalleryController.uploadMedia);

// GET /api/gallery - Get all gallery items
router.get("/", GalleryController.getGallery);
// DELETE /api/gallery/clear/all - Clear all gallery items (for testing)
router.delete("/clear/all", GalleryController.clearGallery);

// GET /api/gallery/:id - Get single gallery item
router.get("/:id", GalleryController.getGalleryItem);

// DELETE /api/gallery/:id - Delete gallery item
router.delete("/:id", GalleryController.deleteGalleryItem);

module.exports = router;
