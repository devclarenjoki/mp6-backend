const Product = require("../models/ProductModel");
const paypal = require("paypal-rest-sdk");
const Payment = require("../models/PaymentModel");
// const fetch = require("node-fetch").default; 

// let fetch;
// if (parseInt(process.versions.node.split('.')[0], 10) >= 12) {
//   fetch = require('node-fetch');
// } else {
//   fetch = require('node-fetch').default;
// }

paypal.configure({
  mode: "sandbox", // Replace with 'live' for production
  client_id: "AX8JiryqwdXZ7airFEonNu_hT1NKL4_4LcWFETUx9q25W1GBdmPy6PS-QHvlGR-XEeY7RB2VqrPWlIpr",
  client_secret: "EELuGRRtjL_9WR0mnw21Xu1l8_vD_ga3m8GXun4vJDPJy876BnVHpq2kqk4RSS9AhRkS82iI-hNvQIQ1",
});

const base = "https://sandbox.paypal.com";

exports.createPayment = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log(req.body, 'body')
    const product = await Product.findById(productId);
    console.log(product, "product");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const paymentData = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:3000/paypal/success",
        cancel_url: "http://localhost:3000/paypal/cancel",
      },
      transactions: [
        {
          item_list: {
            items: [{
                name: "Redhock Bar Soap",
                sku: "001",
                price: "25.00",
                currency: "USD",
                quantity: 1
            }]
        },
          amount: {
            total: product.price.toFixed(2),
            currency: "USD",
          },
          title: product.title,
          description: product.description,
        },
      ],
    };

    paypal.payment.create(paymentData, async (error, payment) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ error: "An error occurred while creating the payment" });
      }

      const { id, links } = payment;
      const paymentTransaction = new Payment({
        user: req.user.userId, // Assuming the user ID is stored in the req.user object after authentication
        product: product._id,
        amount: product.price,
        transactionId: id,
      });
      await paymentTransaction.save();

      const redirectUrl = links.find(
        (link) => link.rel === "approval_url"
      ).href;
      res.status(200).json({ paymentId: id, redirectUrl });
    });
  } catch (error) {
    console.log(error, "error");
    res
      .status(500)
      .json({ error: "An error occurred while creating the payment" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    console.log(product, "product");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: product.price.toFixed(2),
            },
          },
        ],
      }),
    });

    return handleResponse(response);
  } catch (error) {
    console.log(error, "error");
    res
      .status(500)
      .json({ error: "An error occurred while creating the payment" });
  }
};

exports.capturePayment = async (orderId) => {

  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
};

async function generateAccessToken() {
  try {
    const auth = Buffer.from(
      "AX8JiryqwdXZ7airFEonNu_hT1NKL4_4LcWFETUx9q25W1GBdmPy6PS-QHvlGR-XEeY7RB2VqrPWlIpr" + ":" + "EELuGRRtjL_9WR0mnw21Xu1l8_vD_ga3m8GXun4vJDPJy876BnVHpq2kqk4RSS9AhRkS82iI-hNvQIQ1"
      // process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
    ).toString("base64");

    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "post",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.status === 200 || response.status === 201) {
      const jsonData = await response.json();
      return jsonData.access_token;
    }

    const errorMessage = await response.text();
    throw new Error(errorMessage);
  } catch (error) {
    console.log(error, "error");
    throw new Error("An error occurred while generating the access token");
  }
}

const handleResponse = async (response) => {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  const errorMessage = await response.text();
  throw new Error(errorMessage);
}
