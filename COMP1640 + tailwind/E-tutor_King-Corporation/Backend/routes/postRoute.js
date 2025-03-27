const express = require("express");
const router = express.Router(); // Create a router
const postController = require("../controllers/postController");
const verifyToken = require("../Middleware/authMiddleware");

// Define routes
router.get("/", verifyToken(), postController.getAllPosts);
router.post("/", verifyToken(), postController.createPost);
router.delete("/:id", verifyToken(), postController.deletePost);
router.post("/:id/like", verifyToken(), postController.likePost);

// Export the router
module.exports = router;
