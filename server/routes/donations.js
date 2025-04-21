import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { NewUsers } from "../models/newUsers.js";
import { Donation } from "../models/Donation.js";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create", async (req, res) => {
  try {
    const { name, email, phone, bloodType, message, donorId } = req.body;

    // Verify user exists
    const user = await NewUsers.findById(email);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Create donation
    const donation = new Donation({
      name,
      email,
      phone,
      bloodType,
      message,
      donorId,
      status: "pending",
    });

    await donation.save();

    // Update user's donation history
    await NewUsers.findByIdAndUpdate(donorId, {
      $push: {
        donationHistory: {
          donationId: donation._id,
          date: new Date(),
          bloodType,
          status: "pending",
        },
      },
      lastDonation: new Date(),
    });

    res.status(201).json({
      status: "success",
      data: donation,
    });
  } catch (error) {
    console.error("Donation error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.use(authMiddleware);

// Create a donation
router.post("/create-donation", async (req, res) => {
  try {
    const { amount, paymentMethodId, isRecurring, interval } = req.body;

    // Create a customer if they don't exist
    let customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      email: req.user.email,
    });

    let paymentIntent;

    if (isRecurring) {
      // Create a subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price_data: {
              currency: "eur",
              unit_amount: amount,
              product_data: {
                name: "Recurring Donation",
              },
              recurring: {
                interval: interval,
              },
            },
          },
        ],
        payment_settings: {
          payment_method_types: ["card"],
          save_default_payment_method: "on_subscription",
        },
        expand: ["latest_invoice.payment_intent"],
      });

      paymentIntent = subscription.latest_invoice.payment_intent;
    } else {
      // Create a one-time payment
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "eur",
        customer: customer.id,
        payment_method: paymentMethodId,
        confirmation_method: "manual",
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/donation-success`,
      });
    }

    res.json({
      status: "success",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
