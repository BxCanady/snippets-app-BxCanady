import express from "express";
const router = express.Router();
import { Post, Like } from "../models";
import { requireAuth } from "../middleware";

// Define a new populate query for the 'likes' field
const likesPopulateQuery = {
  path: "likes",
  model: "User",
  select: "likes",
};

router.get("/", async (req, res) => {
  const populateQuery = [
    { path: "author", select: ["username", "profile_image"] },
    {
      path: "comments",
      populate: { path: "author", select: ["username", "profile_image"] },
    },
    likesPopulateQuery, // Add the likes populate query
  ];
  const posts = await Post.find({})
    .sort({ created: -1 })
    .populate(populateQuery)
    .exec();

  res.json(posts.map((post) => post.toJSON()));
});

router.post("/", requireAuth, async (req, res, next) => {
  const { text } = req.body;
  const { user } = req;

  const post = new Post({
    text: text,
    author: user._id,
  });

  try {
    const savedPost = await post.save();
    user.posts = user.posts.concat(savedPost._id);

    await user.save();

    res.json(savedPost.toJSON());
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res) => {
  const populateQuery = [
    { path: "author", select: ["username", "profile_image"] },
    {
      path: "comments",
      populate: { path: "author", select: ["username", "profile_image"] },
    },
    likesPopulateQuery, // Add the likes populate query
  ];
  const post = await Post.findById(req.params.id)
    .populate(populateQuery)
    .exec();
  if (post) {
    res.json(post.toJSON());
  } else {
    res.status(404).end();
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  const postId = req.params.id;
  const { user } = req;

  try {
    // Use findByIdAndDelete to delete the post by its ID
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      // If the post does not exist, return a 404 status
      return res.status(404).json({ error: "Post not found" });
    }

    // Remove the deleted post ID from the user's posts array
    user.posts = user.posts.filter((postId) => postId.toString() !== deletedPost._id.toString());

    await user.save();

    // If the deletion was successful, return a 200 status
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    // If there's any error during the database query, return a 404 status
    res.status(404).json({ error: "Post not found" });
  }
});

// Like a post
router.all("/like/:postId", requireAuth, async (req, res) => {
  const { postId } = req.params;
  const { user } = req;

  try {
    // Check if the user has already liked the post
    const existingLike = await Like.findOne({ user: user._id, post: postId });

    if (!existingLike) {
      // If the user hasn't liked the post yet, create a new like
      const newLike = new Like({ user: user._id, post: postId });
      await newLike.save();
      return res.status(200).json({ message: 'Post liked successfully' });
    } else {
      // If the user has already liked the post, remove their like
      await Like.findByIdAndDelete(existingLike._id);
      return res.status(200).json({ message: 'Post unliked successfully' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put("/comments", async (req, res, next) => {
  const { text, userId, postId } = req.body;
  const comment = {
    text: text,
    author: userId,
  };
  const populateQuery = [
    { path: "comments.author", select: ["username", "profile_image"] },
  ];
  Post.findByIdAndUpdate(
    postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate(populateQuery)
    .exec((err, result) => {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    });
});

module.exports = router;
