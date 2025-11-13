import User from "../models/User.js";
import jwt from "jsonwebtoken";

/**
 * Generate JWT token for a user
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

/*
  @route   POST /api/auth/register
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user in the database with hashed password
    const user = await User.create({ name, email, password: hashedPassword });

    // Send response with user info and JWT token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });

    console.log("New user registered:", user.email);
  } catch (error) {
    next(error);
  }
};
/*
  @route   POST /api/auth/login
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id), // Generate JWT token
      });
    } else {
      // Invalid credentials
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    next(error);
  }
};

/*
 @route   GET /api/auth/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is set in protect middleware after verifying JWT
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    res.json(user);
  } catch (error) {
    next(error);
  }
};
