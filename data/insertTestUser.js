// const mongoose = require("mongoose");
// const User = require("../models/user");
// const connectDB = require("../config/db");

// connectDB();

// async function insertTestUser() {
//     try {
//         // Check if user already exists
//         const existingUser = await User.findOne({ email: "teamwork123@gmail.com" });
//         if (existingUser) {
//             console.log("Test user already exists:", existingUser);
//             return;
//         }

//         const result = await User.create({
//             username: "teamwork",
//             email: "teamwork123@gmail.com",
//             password: "Team12345",
//             role: "user",
//         });

//         console.log("Test user inserted successfully:", result);
//     } catch (error) {
//         console.error("Insert test user failed:", error);
//     } finally {
//         mongoose.connection.close();
//     }
// }

// insertTestUser();