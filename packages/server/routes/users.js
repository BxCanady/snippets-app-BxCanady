import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models";
import { requireAuth } from "../middleware";

const router = express.Router();

router.route("/:username").get(async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username })
      .populate({
        path: "posts", // Populate the user's posts
        populate: { path: "author", select: ["username", "profile_image"] },
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.toJSON());
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Internal server error" });
  }
}).put(async (req, res) => {
  const { username } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Validate the new password length
    if (newPassword.length < 8 || newPassword.length > 20) {
      return res.status(400).json({ error: "Password must be 8-20 characters long" });
    }

    // Update user's password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = newPasswordHash;
    await user.save();

    res.json(user.toJSON());
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Internal server error" });
  }
});

router.route("/:username/avatar").put(requireAuth, async (req, res) => {
  const { username } = req.params;
  const { profile_image } = req.body;

  // Check if the authenticated user is updating their own avatar
  if (req.user.username.toLowerCase() !== username.toLowerCase()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's profile image
    user.profile_image = profile_image;
    await user.save();

    res.json(user.toJSON());
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
