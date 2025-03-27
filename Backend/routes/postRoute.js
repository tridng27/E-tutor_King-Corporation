const express = require("express");
const router = express.Router(); // Create a router
const postController = require("../controllers/postController");
const verifyToken = require("../Middleware/authMiddleware");

// Define routes
router.get("/", verifyToken(), postController.getAllPosts);
router.post("/", verifyToken(), postController.createPost);
router.put("/:id", verifyToken(), postController.updatePost); // Add this route for editing posts
router.delete("/:id", verifyToken(), postController.deletePost);
router.post("/:id/like", verifyToken(), postController.likePost);

// Comment routes
router.post("/:id/comments", verifyToken(), postController.addComment);
router.get("/:id/comments", verifyToken(), postController.getPostComments);
router.put("/:postId/comments/:commentId", verifyToken(), postController.updateComment); // Add this route for editing comments
router.delete("/:postId/comments/:commentId", verifyToken(), postController.deleteComment);

// Export the router
module.exports = router;
