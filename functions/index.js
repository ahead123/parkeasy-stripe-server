/* eslint-disable new-cap */
/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
/* eslint object-curly-spacing: ["error", "always"] */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");
const stripe = Stripe(process.env.SPOTSY_STRIPE_SECRET_TEST_KEY);
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((req, res) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  res.json({ message: "Hello from Firebase!" });
});

exports.createStripePaymentSheet = functions.https.onRequest(
  async (req, res) => {
    const { email, amount } = req.body;
    try {
      functions.logger.info("***** searching for stripe customer *******", {
        structuredData: true,
      });
      const customer = await stripe.customers.search({
        query: 'email:"' + email + '"',
      });
      const { data } = customer;
      const { id } = data[0];
      functions.logger.info("***** found stripe customer *******", {
        structuredData: true,
        email,
        id,
      });
      functions.logger.info("***** creating stripe ephemeral key *******", {
        structuredData: true,
      });
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: id },
        { apiVersion: "2020-08-27" }
      );
      functions.logger.info(
        "***** stripe ephemeral key create success *******",
        {
          structuredData: true,
        }
      );
      functions.logger.info("***** creating stripe payment intent *******", {
        structuredData: true,
      });
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        customer: id,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      functions.logger.info(
        "***** stripe payment intent create success *******",
        {
          structuredData: true,
          customer: id,
          amount,
        }
      );
      functions.logger.info("***** sending stripe payload to client *******", {
        structuredData: true,
      });
      res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: id,
        publishableKey: process.env.SPOTSY_STRIPE_PUBLISHABLE_TEST_KEY,
      });
    } catch (error) {
      console.log(error);
      functions.logger.info("***** stripe payment error *******", {
        structuredData: true,
        error,
      });
      res.json(error);
    }
  }
);
