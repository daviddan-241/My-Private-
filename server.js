require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const Stripe = require('stripe');
const app = express();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3000;

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/upload', upload.single('media'), async (req, res) => {
  try {
    const file = req.file;
    const type = req.body.type;
    if (!file) return res.status(400).send('No file uploaded');

    const amount = type === 'image' ? 95 : 260; // cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: file.originalname },
          unit_amount: amount
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.DOMAIN}/success.html?file=${file.filename}`,
      cancel_url: `${process.env.DOMAIN}/cancel.html`,
      metadata: { filename: file.filename }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).send('Payment creation failed');
  }
});

app.use('/uploads', express.static('uploads'));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));