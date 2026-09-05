const express = require("express");

const authenticateFirebaseToken = require("../middleware/authMiddleware");
const userRepository = require("../repositories/userRepository");

const router = express.Router();


// GET CURRENT USER
router.get("/me", authenticateFirebaseToken, async (req, res) => {
    try {
        const firebaseUid = req.user.uid;

        const user =
            await userRepository.findUserByFirebaseUid(firebaseUid);

        res.json({
            exists: !!user,
            user: user || null,
        });

    } catch (error) {
        console.error("Error checking user:", error);

        res.status(500).json({
            error: "Failed to check user",
        });
    }
});


router.post("/", authenticateFirebaseToken, async (req, res) => {
  console.log('[POST /api/users] Received request with headers:', req.headers);
  try {

        const firebaseUid = req.user.uid;
        const email = req.user.email;

        const {
            full_name,
            username
        } = req.body;

        if (!username) {
            return res.status(400).json({
                error: "Username is required",
            });
        }

        // Check whether profile already exists
        const existingUser =
            await userRepository.findUserByFirebaseUid(firebaseUid);

        if (existingUser) {
            return res.status(200).json({
                message: "User already exists",
                user: existingUser,
            });
        }

        const newUser = await userRepository.createUser({
            firebase_uid: firebaseUid,
            full_name: full_name || req.user.name || null,
            email: email,
            username: username,
        });

        res.status(201).json({
            message: "User profile created successfully",
            user: newUser,
        });

    } catch (error) {
        console.error("Error creating user:", error);

        res.status(500).json({
            error: "Failed to create user",
        });
    }
});

module.exports = router;