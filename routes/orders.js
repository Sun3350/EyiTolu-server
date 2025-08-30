const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Create new order
router.post("/", async (req, res) => {
  try {
    const orderData = req.body;

    const order = new Order(orderData);
    await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
});

// Get order by payment reference
router.get("/reference/:reference", async (req, res) => {
  try {
    const order = await Order.findOne({
      paymentReference: req.params.reference,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
});

// Verify payment and update order
router.patch("/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    // Update order status to paid
    const order = await Order.findOneAndUpdate(
      { paymentReference: reference },
      {
        status: "paid",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this payment reference",
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      order: order,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
});

// Get user orders by email
router.get("/user/:email", async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user orders",
      error: error.message,
    });
  }
});

// Update order status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order updated successfully",
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
});

module.exports = router;
