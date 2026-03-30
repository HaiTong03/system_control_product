const User = require("../models/user")
const jwt = require("jsonwebtoken")

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d", // 7 days
  })
}

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email.toLowerCase()
          ? "Email already registered"
          : "Username already taken"
      })
    }

    // Create new user
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "user",
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      error: error.message || "Registration failed"
    })
  }
}


// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) return res.status(401).json({ error: "Invalid email or password" })
    if (!user.isActive) return res.status(401).json({ error: "Account is deactivated" })

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password" })

    user.lastLogin = new Date()
    await user.save()

    const token = generateToken(user._id)
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      token,
    })
  } catch (error) {
    res.status(500).json({ error: error.message || "Login failed" })
  }
}
// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json({ user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body
    const userId = req.user.userId

    // Check if email/username is already taken by another user
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ email: email?.toLowerCase() }, { username }] }
      ]
    })

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email?.toLowerCase()
          ? "Email already taken"
          : "Username already taken"
      })
    }

    const updateData = {}
    if (username) updateData.username = username.trim()
    if (email) updateData.email = email.toLowerCase().trim()

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password")

    res.json({
      message: "Profile updated successfully",
      user
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}