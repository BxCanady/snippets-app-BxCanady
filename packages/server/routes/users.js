import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models";
import { requireAuth } from "../middleware";

const router = express.Router();

router
  .route("/:username")
  .get(async (req, res) => {
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
      res.status(500).json({ error: "Internal server error" });
    }
  })
  .put(async (req, res) => {
    const { password, email } = req.body;
    const { username } = req.params;

    const hashedpassword = await bcrypt.hash(password, 12);

    try {
      const userUpdate = await User.findOneAndUpdate(
        {
          username,
        },
        {
          passwordHash: hashedpassword,
          email, // Add email to the user update
        },
        {
          new: true,
        }
      );

      res.json(userUpdate.toJSON());
    } catch (error) {
      res.status(404).end();
    }
  });

router.route("/:username/avatar").put(requireAuth, async (req, res) => {
  const { username } = req.params;
  const { profile_image } = req.body;

  if (!req.user.username.toLowerCase() === username.toLowerCase()) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  user.profile_image = profile_image;
  await user.save();
  res.json(user.toJSON());
});

module.exports = router;
