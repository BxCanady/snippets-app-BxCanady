import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 120,
    },
    author: {
      type: ObjectId,
      ref: "User",
    },
    created: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 120,
    },
    author: {
      type: ObjectId,
      ref: "User",
    },
    created: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: ObjectId,
        ref: "User", // Replace with the actual name of your User model
      },
    ],
    comments: [commentSchema], // Use the comment schema for comments
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
