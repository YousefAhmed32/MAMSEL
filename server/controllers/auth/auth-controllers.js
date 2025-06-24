const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: 'User already exists with the same email. Please try another one.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: 'Registration successful ✅',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.json({
        success: false,
        message: "User doesn't exist! Please register first.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.json({
        success: false,
        message: 'Incorrect password! Please try again.',
      });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        role: existingUser.role,
        email: existingUser.email,
        userName: existingUser.userName,
      },
      process.env.JWT_SECRET || 'CLIENT__SECRET__KEY',
      { expiresIn: '120m' }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      })
      .json({
        success: true,
        message: 'Logged in successfully.',
        user: {
          email: existingUser.email,
          id: existingUser._id,
          role: existingUser.role,
          userName: existingUser.userName,

        },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
};

// Logout
const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  }).status(200).json({
    success: true,
    message: 'Logged out successfully!',
  });
};

// Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized user!',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'CLIENT__SECRET__KEY');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized user!',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
};
