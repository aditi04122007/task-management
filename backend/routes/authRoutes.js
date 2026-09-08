const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword
} = require("../controllers/authController");

// PUBLIC ROUTES
router.post("/register", registerUser);
router.post("/login", loginUser);

// STEP 18: GET USER PROFILE (JWT Required)
router.get("/profile", authenticateToken, getUserProfile);

// STEP 19: UPDATE PROFILE (JWT Required)
router.put("/profile", authenticateToken, updateUserProfile);

// STEP 20: CHANGE PASSWORD (JWT Required)
router.put("/change-password", authenticateToken, changePassword);

module.exports = router;