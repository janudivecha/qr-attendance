// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (Only once!)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Models
const User = require('./models/User');

// Routes
app.get('/', (req, res) => {
  // generate or get your QR code data URI here, or set it null if not generated yet
  const qr = null; // or actual qr code data URI string

  res.render('index', { qr: qr });
});


app.post('/scan', async (req, res) => {
  const { qrData } = req.body;
  let user = await User.findOne({ qrCode: qrData });

  if (!user) {
    // Add user if not found
    user = new User({ name: qrData, qrCode: qrData, present: true });
    await user.save();
  } else {
    // Mark attendance
    user.present = true;
    await user.save();
  }

  res.redirect('/');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});
