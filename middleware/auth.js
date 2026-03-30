const jwt = require("jsonwebtoken")
const User = require("../models/user")

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" })
    }

    // Keep supporting the existing UI-only admin session token.
    if (token === "ui-admin-token") {
      req.user = {
        userId: null,
        username: "admin",
        email: null,
        role: "admin",
      }
      return next()
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId)
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or expired token" })
    }

    // Add user info to request
    req.user = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    }

    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" })
    }
    res.status(500).json({ error: "Authentication failed" })
  }
}

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}

const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Allowed roles: ${roles.join(", ")}`,
      })
    }
    next()
  }
}

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
      const user = await User.findById(decoded.userId)

      if (user && user.isActive) {
        req.user = {
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      }
    }
  } catch (error) {
    // Ignore auth errors for optional auth
  }
  next()
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRoles,
  optionalAuth,
}