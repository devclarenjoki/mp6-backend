const Payment = require('../models/PaymentModel');
const Product = require('../models/ProductModel');
const paypal = require('paypal-rest-sdk');

// Initialize PayPal SDK with your credentials
paypal.configure({
  mode: 'sandbox', // Replace with 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET_KEY,
});

// Create a payment transaction
exports.createPayment = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    console.log(product, "product")
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const paymentData = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: 'http://localhost:3000/paypal/success',
        cancel_url: 'http://localhost:3000/paypal/cancel',
      },
      transactions: [
        {
          amount: {
            total: product.price.toFixed(2),
            currency: 'USD',
          },
          title: product.title,
          description: product.description,
        },
      ],
    };

    paypal.payment.create(paymentData, async (error, payment) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while creating the payment' });
      }

      const { id, links } = payment;
      const paymentTransaction = new Payment({
        user: req.user.userId, // Assuming the user ID is stored in the req.user object after authentication
        product: product._id,
        amount: product.price,
        transactionId: id,
      });
      await paymentTransaction.save();

      const redirectUrl = links.find((link) => link.rel === 'approval_url').href;
      res.status(200).json({ paymentId: id, redirectUrl });
    });
  } catch (error) {
    console.log(error, "error")
    res.status(500).json({ error: 'An error occurred while creating the payment' });
  }
};

// Process a completed payment
exports.processPayment = async (req, res) => {
  try {
    const { paymentId, PayerID } = req.query;

    paypal.payment.execute(paymentId, { payer_id: PayerID }, async (error, payment) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while processing the payment' });
      }

      const paymentTransaction = await Payment.findOne({ transactionId: paymentId });
      if (!paymentTransaction) {
        return res.status(404).json({ error: 'Payment transaction not found' });
      }

      paymentTransaction.status = 'completed';
      await paymentTransaction.save();

      // Handle additional actions after successful payment
      // e.g., empty the cart, update user/payment details, etc.

      res.status(200).json({ message: 'Payment processed successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the payment' });
  }
};
