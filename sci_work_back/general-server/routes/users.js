const express = require("express")
const router = express.Router()
const User = require("../models/User")
const crypto = require('crypto')
const { getWebSocketByToken } = require("../sockets/websockets")

const loggedInUsers = new Set()

// GET all users
router.get("/get", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users)
  } catch (error) {
    console.error("Error fetching users:", error.message)
    res.status(500).json({ message: "Internal server error" })
  }
})

/* POST: Add a new user
// router.post("/add", async (req, res) => {
//     const { name, surName, login, password, mail } = req.body
    
//     if (!name || !surName || !login || !password || !mail || ) {
//         return res.status(400).json({ message: "All required fields must be provided" })
//     }
    
//     try {
//         const newUser = new User({ name, surName, login, password, mail })
//         await newUser.save() // Save the user in the database
//         res.status(201).json({ message: "User created successfully", user: newUser })
//     } catch (error) {
//         console.error("Error creating user:", error.message)
//         res.status(500).json({ message: "Internal server error" })
//     }
})*/

/* PUT: Update a user's details
// router.put("/:id", async (req, res) => {
//   const { id } = req.params
//   const updates = req.body // Assume all updates are sent in the body

//   try {
//     const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true })
//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     res.status(200).json({ message: "User updated successfully", user: updatedUser })
//   } catch (error) {
//     console.error("Error updating user:", error.message)
//     res.status(500).json({ message: "Internal server error" })
//   }
})*/

// POST: LogIn
router.post("/login", async (req, res) => {
  const { login, password } = req.body; // Use login and password from the client
  try {
    // Find user by login and password
    const user = await User.findOne({ login: login, password: password })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if already logged in
    if (loggedInUsers.has(login)) {
      return res.status(401).json({ message: "User is already logged in" })
    }

    // Generate a unique session token (need to redo with cookies!)
    const sessionToken = crypto.randomBytes(64).toString("hex")

    // Get WebSocket connection for logged-in user
    const ws = getWebSocketByToken(sessionToken) // Fetch the specific WebSocket by session token
    if (ws) {
      console.error("WebSocket client already exist for user:", login)
    } else {
      console.error("WebSocket client not found for user:", login)
    }

    return res.status(200).json({ message: "Login successful", sessionToken })
  } catch (error) {
    console.error("Login error:", error.message)
    return res.status(500).json({ message: "Internal server error", error: error.message })
  }
})

module.exports = router