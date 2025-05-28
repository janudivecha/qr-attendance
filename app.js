const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const User = require('./models/User');
const Attendance = require('./models/Attendance');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
require('dotenv').config();
// Connect to MongoDB (make sure mongod is running)
mongoose.connect('mongodb://localhost:27017/qr_attendance', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useUnifiedTopology: true,
});
app.get('/', async (req, res) => {
  // Generate single shared QR code data URI for fixed string
  const attendanceUrl = 'http://172.16.0.211:3000/mark-attendance'; 
const qr = await QRCode.toDataURL(attendanceUrl);

  res.render('index', { qr });
});
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 }); // sorted by name
    res.render('users', { users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
app.get('/', async (req, res) => {
  const attendanceUrl = 'http://172.16.0.211:3000/mark-attendance';  // Replace with your server IP or domain
  const qr = await QRCode.toDataURL(attendanceUrl);
  res.render('index', { qr });
});
app.get('/mark-attendance', (req, res) => {
  res.render('mark-attendance');
});

app.post('/mark', async (req, res) => {
  const { uniqueId } = req.body;
  if (!uniqueId) return res.send('Please provide your unique ID.');

  try {
    let user = await User.findOne({ uniqueId });
    if (!user) {
      return res.send('User not found. Please register first.');
    }

    // Optional: prevent multiple marks within 5 minutes
    const recent = await Attendance.findOne({
      userId: user._id,
      timestamp: { $gt: new Date(Date.now() - 5 * 60000) },
    });

    if (recent) return res.send('Attendance already marked recently.');

    await Attendance.create({ userId: user._id });
    res.send(`Attendance marked for ${user.name}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Add a simple user registration form and handler for testing
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { name, uniqueId } = req.body;
  if (!name || !uniqueId) return res.send('Please fill all fields.');

  try {
    let exists = await User.findOne({ uniqueId });
    if (exists) return res.send('User with this unique ID already exists.');

    await User.create({ name, uniqueId });
    res.send('User registered successfully. Go back to <a href="/">home</a>.');
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

app.listen(3000, () => console.log('Server started at http://localhost:3000'));
