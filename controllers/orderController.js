const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const paypal = require('paypal-rest-sdk'); // PayPal SDK module

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const order = new Order({
      user: req.user.userId, // Assuming the user ID is stored in the req.user object after authentication
      products: [{ product: product._id, quantity }],
      totalPrice: product.price * quantity,
    });

    await order.save();

    res.status(201).json({ message: 'Order created successfully', orderId: order._id });
  } catch (error) {
    console.log(error, "error")
    res.status(500).json({ error: 'An error occurred while creating the order' });
  }
};

// Process payment using PayPal
exports.processPayment = async (req, res) => {
  try {
    const { orderId, returnUrl, cancelUrl } = req.body;
    const order = await Order.findById(orderId).populate('products.product');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Create PayPal payment payload
    const paymentPayload = {
      intent: 'sale',
      payer: { payment_method: 'paypal' },
      redirect_urls: { return_url: returnUrl, cancel_url: cancelUrl },
      transactions: [
        {
          amount: {
            total: order.totalPrice.toString(),
            currency: 'USD',
          },
          item_list: {
            items: order.products.map((item) => ({
              name: item.product.title,
              price: item.product.price.toString(),
              currency: 'USD',
              quantity: item.quantity,
            })),
          },
          description: 'Order description',
        },
      ],
    };

    // Create PayPal payment
    paypal.payment.create(paymentPayload, (error, payment) => {
        console.log(error, "error")
      if (error) {
        return res.status(500).json({ error: 'An error occurred while processing the payment' });
      }

      // Store the payment ID in the order document
      order.paymentId = payment.id;
      order.save();

      // Redirect the user to the PayPal payment approval URL
      const redirectUrl = payment.links.find((link) => link.rel === 'approval_url').href;
      res.status(200).json({ redirectUrl });
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the payment' });
  }
};

// Handle PayPal payment success
exports.paymentSuccess = async (req, res) => {
  try {
    const { paymentId, token, PayerID } = req.query;
    const order = await Order.findOne({ paymentId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Execute the PayPal payment
    paypal.payment.execute(paymentId, { payer_id: PayerID }, async (error) => {
      if (error) {
        return res.status(500).json({ error: 'An error occurred while processing the payment' });
      }

      // Update order payment status
      order.paymentStatus = 'completed';
      await order.save();

      // Return success response
      res.status(200).json({ message: 'Payment completed successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the payment' });
  }
};
