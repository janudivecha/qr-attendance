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
app.use(bodyParser.json());
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
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  // TODO: Add your logic to save user in DB here
  
  console.log('Register data:', username, password);
  
  // After processing, redirect or send response
  res.send('User registered successfully');
});

app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/users', async (req, res) => {
  try {
    // Example: fetch users from your database
    const users = await User.find();  // assuming you have a User model
    
    // Render a page or send JSON
    res.render('users', { users });  // if you have a 'users.ejs' view
    
    // OR send JSON:
    // res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
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
app.post('/mark', (req, res) => {
  const uniqueId = req.body.uniqueId;  // Make sure body-parser is enabled

  // Your logic to mark attendance with uniqueId, for example:
  // 1. Check if user exists
  // 2. Mark attendance in DB

  console.log('Attendance marked for user:', uniqueId);

  res.send('Attendance marked for ' + uniqueId);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});
