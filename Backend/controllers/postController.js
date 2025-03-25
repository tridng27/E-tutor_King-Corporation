const User = require("../models/user.js");
const Post = require("../models/post.js");

// Get all posts (visible to all authenticated users)
exports.getAllPosts = async (req, res) => {
  try {
    console.log("Getting all posts, user:", req.user);
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["UserID", "Name", "Email", "Role"] // Exclude password
        }
      ],
      order: [["CreatedAt", "DESC"]]
    });
    
    console.log(`Found ${posts.length} posts`);
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    console.log("Create post request received:", req.body);
    console.log("User from request:", req.user);
    
    const { content, hashtags, imageURL } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }
    
    // Check if user exists in the request
    if (!req.user || !req.user.UserID) {
      console.error("User not found in request or missing UserID:", req.user);
      return res.status(401).json({ message: "User authentication failed" });
    }
    
    // Log the data we're trying to insert
    const postData = {
      UserID: req.user.UserID,
      Content: content,
      Hashtags: hashtags || [],
      ImageURL: imageURL || null
    };
    console.log("Creating post with data:", postData);
    
    // Create the post
    const newPost = await Post.create(postData);
    console.log("Post created successfully:", newPost);
    
    // Fetch the created post with user details
    const postWithUser = await Post.findByPk(newPost.PostID, {
      include: [
        {
          model: User,
          attributes: ["UserID", "Name", "Email", "Role"]
        }
      ]
    });
    
    res.status(201).json({ 
      message: "Post created successfully", 
      post: postWithUser 
    });
  } catch (error) {
    console.error("Error creating post:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Error creating post", 
      error: error.message,
      stack: error.stack 
    });
  }
};

// Delete a post (only owner or admin can delete)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete post with ID: ${id}`);
    console.log("User making request:", req.user);
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if user is post owner or admin
    if (post.UserID !== req.user.UserID && req.user.Role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own posts" });
    }
    
    await post.destroy();
    console.log(`Post ${id} deleted successfully`);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to like post with ID: ${id}`);
    console.log("User making request:", req.user);
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Increment likes
    post.Likes = post.Likes + 1;
    await post.save();
    
    console.log(`Post ${id} liked successfully, new like count: ${post.Likes}`);
    res.status(200).json({ message: "Post liked successfully", likes: post.Likes });
  } catch (error) {
    console.error("Error liking post:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Error liking post", error: error.message });
  }
};
