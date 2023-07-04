const Cart = require('../models/CartModel');
const paypal = require('paypal-rest-sdk');

// Configure PayPal SDK with your credentials
paypal.configure({
  mode: 'sandbox', // Change to 'live' for production
  client_id: 'YOUR_PAYPAL_CLIENT_ID',
  client_secret: 'YOUR_PAYPAL_CLIENT_SECRET',
});

// Add item to cart or update quantity
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const customerId = req?.user?.userId;

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({ customerId, products: [] });
    }

    console.log(cart, 'cart')

    // Check if the product already exists in the cart
    const existingProductIndex = cart.products.findIndex((item) => item.productId.toString() === productId);
    if (existingProductIndex > -1) {
      // Update the quantity of the existing product
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      // Add the new product to the cart
      cart.products.push({ productId, quantity });
    }

    await cart.save();
    res.status(201).json({ message: 'Product added to cart successfully', cart });
  } catch (error) {
    console.log(error, 'error');
    res.status(500).json({ error: 'An error occurred while adding the product to the cart' });
  }
};

// List all items in the cart
exports.listCartItems = async (req, res) => {
  try {
    const customerId = req?.user?.userId;
    const cart = await Cart.findOne({ customerId }).populate('products.productId');
    res.status(200).json(cart.products);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while listing cart items' });
  }
};

// Initiate PayPal payment
exports.initiatePayment = async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const cart = await Cart.findById(cartId).populate('products.productId');

    // Create a PayPal payment object
    const payment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: 'http://your-website.com/success',
        cancel_url: 'http://your-website.com/cancel',
      },
      transactions: [
        {
          item_list: {
            items: cart.products.map((item) => ({
              name: item.productId.title,
              sku: item.productId._id,
              price: item.productId.price,
              currency: 'USD',
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: 'USD',
            total: cart.totalPrice,
          },
          description: 'Purchase from mp6.com',
        },
      ],
    };

    // Create a PayPal payment and redirect to the PayPal approval URL
    paypal.payment.create(payment, (error, createdPayment) => {
      if (error) {
        res.status(500).json({ error: 'An error occurred while creating the PayPal payment' });
      } else {
        const approvalUrl = createdPayment.links.find((link) => link.rel === 'approval_url').href;
        res.json({ approvalUrl });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while initiating the payment' });
  }
};

// Complete PayPal payment
exports.completePayment = (req, res) => {
  const paymentId = req.query.paymentId;
  const payerId = { payer_id: req.query.PayerID };

  // Execute the PayPal payment
  paypal.payment.execute(paymentId, payerId, async (error, payment) => {
    if (error) {
      res.status(500).json({ error: 'An error occurred while completing the payment' });
    } else {
      // Update the cart and perform other necessary operations (e.g., generate download link, send confirmation email)
      const cartId = req.params.cartId;
      const cart = await Cart.findById(cartId);

      // Clear the cart or mark it as completed
      // ...

      res.json({ message: 'Payment completed successfully' });
    }
  });
};
  
