const express = require("express");
const router = express.Router();
const axios = require("axios");
const Order = require("../models/Order");

// Initialize Paystack payment
router.post("/initialize", async (req, res) => {
  try {
    const { email, amount, metadata, orderId } = req.body;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Initialize Paystack payment
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Convert to kobo
        currency: "NGN",
        metadata: {
          ...metadata,
          order_id: orderId,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderId,
            },
          ],
        },
        callback_url: `${process.env.FRONTEND_URL}/gift-registry?payment=callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (paystackResponse.data.status) {
      // Update order with payment reference
      await Order.findByIdAndUpdate(orderId, {
        paymentReference: paystackResponse.data.data.reference,
      });

      res.json({
        success: true,
        message: "Payment initialized successfully",
        data: {
          paymentUrl: paystackResponse.data.data.authorization_url,
          reference: paystackResponse.data.data.reference,
        },
      });
    } else {
      throw new Error(paystackResponse.data.message);
    }
  } catch (error) {
    console.error("Payment initialization error:", error);
    res.status(500).json({
      success: false,
      message: "Error initializing payment",
      error: error.message,
    });
  }
});

// Verify payment with Paystack
router.get("/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (
      paystackResponse.data.status &&
      paystackResponse.data.data.status === "success"
    ) {
      const paymentData = paystackResponse.data.data;

      // Update order status
      const order = await Order.findOneAndUpdate(
        { paymentReference: reference },
        {
          status: "paid",
          paystackReference: paymentData.reference,
          totalAmount: paymentData.amount / 100,
          updatedAt: new Date(),
        },
        { new: true }
      );

      res.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          status: "success",
          order: order,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
        data: paystackResponse.data,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
});

// Paystack webhook handler
router.post("/webhook", async (req, res) => {
  try {
    const secret = req.headers["x-paystack-signature"];
    const payload = req.body;

    // Verify webhook signature (you should implement proper signature verification)

    if (payload.event === "charge.success") {
      const { reference, amount, customer } = payload.data;

      // Update order status
      const order = await Order.findOneAndUpdate(
        { paymentReference: reference },
        {
          status: "paid",
          paystackReference: reference,
          totalAmount: amount / 100,
          updatedAt: new Date(),
        },
        { new: true }
      );

      console.log("Order updated via webhook:", order?._id);
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook error");
  }
});

module.exports = router;
