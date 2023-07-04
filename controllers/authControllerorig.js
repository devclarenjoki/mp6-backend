const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const { secretKey } = require('../config');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while registering user' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user with the provided email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if the password needs rehashing
    const shouldRehashPassword = await bcrypt.compare(password, user.password);
    if (shouldRehashPassword) {
      // Rehash the password and update it in the database
      const newHashedPassword = await bcrypt.hash(password, 10);
      user.password = newHashedPassword;
      await user.save();
    }

    // Generate a token
    const token = generateToken(user._id);

    // Send the response with the token and user details
    res.json({ token, user });
  } catch (error) {
    console.log(error, 'error');
    res.status(500).json({ error: 'An error occurred while logging in' });
  }
};








// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
//     res.json({ token, user });
//     console.log(token, 'token')
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred while logging in' });
//   }
// };
