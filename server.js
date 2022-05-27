import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Stripe from "stripe";

const stripe = Stripe(process.env.SPOTSY_STRIPE_SECRET_TEST_KEY);

const PORT = 3000;
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.post("/payment-sheet", async (req, res) => {
  const { email, amount } = req.body;
  console.log("email", email);
  try {
    const customer = await stripe.customers.search({
      query: 'email:"' + email + '"',
    });
    const { data } = customer;
    const { id } = data[0];
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: id },
      { apiVersion: "2020-08-27" }
    );
    console.log("ephemeralKey", ephemeralKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: id,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: id,
      publishableKey: process.env.SPOTSY_STRIPE_PUBLISHABLE_TEST_KEY,
    });
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
