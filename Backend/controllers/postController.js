const { User, Post, Comment } = require("../models");

// Get all posts (visible to all authenticated users)
// Get all posts (visible to all authenticated users)
exports.getAllPosts = async (req, res) => {
  try {
    console.log("Getting all posts, user:", req.user);
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["UserID", "Name", "Email", "Role"] // Exclude password
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["UserID", "Name", "Role"]
            }
          ],
          order: [["CreatedDate", "ASC"]] // Changed from CreatedAt to CreatedDate
        }
      ],
      order: [["CreatedAt", "DESC"]]
    });
   
    // Debug: Log the first post to check LikedBy field
    if (posts.length > 0) {
      console.log("First post raw data:", posts[0].toJSON());
      console.log("LikedBy field exists:", posts[0].LikedBy !== undefined);
      console.log("LikedBy type:", typeof posts[0].LikedBy);
      console.log("LikedBy is array:", Array.isArray(posts[0].LikedBy));
      console.log("LikedBy value:", posts[0].LikedBy);
    }

    // Format the posts to ensure consistent field names
    const formattedPosts = posts.map(post => {
      const plainPost = post.get({ plain: true });
     
      // Debug: Log each post's LikedBy field
      console.log(`Post ${plainPost.PostID} LikedBy:`, plainPost.LikedBy);
     
      // Ensure LikedBy is initialized if null or undefined
      if (!plainPost.LikedBy) {
        console.log(`Initializing LikedBy for post ${plainPost.PostID}`);
        plainPost.LikedBy = [];
      } else if (!Array.isArray(plainPost.LikedBy)) {
        // Convert to array if it's not already an array
        console.log(`Converting LikedBy to array for post ${plainPost.PostID}`);
        try {
          if (typeof plainPost.LikedBy === 'string') {
            plainPost.LikedBy = JSON.parse(plainPost.LikedBy);
          } else {
            plainPost.LikedBy = [];
          }
        } catch (e) {
          console.error(`Error parsing LikedBy for post ${plainPost.PostID}:`, e);
          plainPost.LikedBy = [];
        }
      }
     
      // Format comments if they exist
      if (plainPost.Comments && plainPost.Comments.length > 0) {
        plainPost.Comments = plainPost.Comments.map(comment => ({
          id: comment.CommentID,
          postId: comment.PostID,
          text: comment.Content,
          createdAt: comment.CreatedDate,
          author: {
            id: comment.User.UserID,
            name: comment.User.Name,
            role: comment.User.Role
          }
        }));
      }
     
      return plainPost;
    });
   
    // Debug: Log the first formatted post
    if (formattedPosts.length > 0) {
      console.log("First formatted post:", {
        postId: formattedPosts[0].PostID,
        likedBy: formattedPosts[0].LikedBy,
        likedByType: typeof formattedPosts[0].LikedBy,
        isArray: Array.isArray(formattedPosts[0].LikedBy)
      });
    }
   
    console.log(`Found ${posts.length} posts`);
    res.status(200).json(formattedPosts);
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
      ImageURL: imageURL || null,
      LikedBy: [] // Initialize empty LikedBy array
    };
    console.log("Creating post with data:", postData);
    console.log("LikedBy in new post data:", postData.LikedBy);
    console.log("LikedBy type:", typeof postData.LikedBy);
    console.log("LikedBy is array:", Array.isArray(postData.LikedBy));
   
    // Create the post
    const newPost = await Post.create(postData);
    console.log("Post created successfully:", newPost.toJSON());
    console.log("New post LikedBy field:", newPost.LikedBy);
    console.log("New post LikedBy type:", typeof newPost.LikedBy);
    console.log("New post LikedBy is array:", Array.isArray(newPost.LikedBy));
   
    // Fetch the created post with user details
    const postWithUser = await Post.findByPk(newPost.PostID, {
      include: [
        {
          model: User,
          attributes: ["UserID", "Name", "Email", "Role"]
        }
      ]
    });
   
    console.log("Fetched post with user:", postWithUser.toJSON());
    console.log("Fetched post LikedBy:", postWithUser.LikedBy);
   
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

// Edit a post (only owner or admin can edit)
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, hashtags, imageURL } = req.body;
   
    console.log(`Attempting to update post with ID: ${id}`);
    console.log("User making request:", req.user);
    console.log("Update data:", { content, hashtags, imageURL });
   
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
   
    console.log("Post before update:", post.toJSON());
    console.log("Post LikedBy before update:", post.LikedBy);
   
    // Check if user is post owner or admin
    if (post.UserID !== req.user.UserID && req.user.Role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own posts" });
    }
   
    // Update post fields
    if (content) post.Content = content;
    if (hashtags) post.Hashtags = hashtags;
    if (imageURL !== undefined) post.ImageURL = imageURL;
    post.UpdatedAt = new Date();
   
    await post.save();
   
    console.log("Post after update:", post.toJSON());
    console.log("Post LikedBy after update:", post.LikedBy);
   
    // Fetch the updated post with user details
    const updatedPost = await Post.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["UserID", "Name", "Email", "Role"]
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["UserID", "Name", "Role"]
            }
          ],
          order: [["CreatedDate", "ASC"]] // Changed from CreatedAt to CreatedDate
        }
      ]
    });
   
    console.log(`Post ${id} updated successfully`);
    console.log("Updated post with includes:", updatedPost.toJSON());
    console.log("Updated post LikedBy:", updatedPost.LikedBy);
   
    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost
    });
  } catch (error) {
    console.error("Error updating post:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error updating post",
      error: error.message,
      stack: error.stack
    });
  }
};

// Edit a comment (only owner or admin can edit)
exports.updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
   
    console.log(`Attempting to update comment ${commentId} on post ${postId}`);
    console.log("User making request:", req.user);
   
    // Validate input
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: "Comment content is required" });
    }
   
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
   
    // Check if user is comment owner or admin
    if (comment.UserID !== req.user.UserID && req.user.Role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own comments" });
    }
   
    // Update comment
    comment.Content = content;
    await comment.save();
   
    // Fetch the updated comment with user details
    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          attributes: ["UserID", "Name", "Role"]
        }
      ]
    });
   
    // Format the response
    const formattedComment = {
      id: updatedComment.CommentID,
      text: updatedComment.Content,
      createdAt: updatedComment.CreatedDate, // Changed from CreatedAt to CreatedDate
      author: {
        id: updatedComment.User.UserID,
        name: updatedComment.User.Name,
        role: updatedComment.User.Role
      }
    };
   
    console.log(`Comment ${commentId} updated successfully`);
    res.status(200).json({
      message: "Comment updated successfully",
      comment: formattedComment
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error updating comment",
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
    if (post.UserID !== req.user.UserID && req.user.Role !== "Admin") {
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

// Like a post - UPDATED to handle toggling likes (one like per user)
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.UserID; // Get the user ID
    
    console.log(`Attempting to toggle like for post with ID: ${id}`);
    console.log("User making request:", req.user);
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    console.log("Post before like toggle:", {
      postId: post.PostID,
      likes: post.Likes,
      likedBy: post.LikedBy,
      likedByType: typeof post.LikedBy,
      isArray: Array.isArray(post.LikedBy)
    });
    
    // Initialize LikedBy array if it doesn't exist
    let likedByArray = [];
    if (post.LikedBy && Array.isArray(post.LikedBy)) {
      likedByArray = [...post.LikedBy];
    }
    
    console.log("Initialized LikedBy array:", likedByArray);
    
    // Check if user has already liked this post
    const userIdStr = String(userId);
    const userIndex = likedByArray.findIndex(id => String(id) === userIdStr);
    let hasLiked = false;
    
    console.log("User index in LikedBy array:", userIndex);
    console.log("Current LikedBy array:", likedByArray);
    
    if (userIndex === -1) {
      // User hasn't liked the post yet, so add their like
      likedByArray.push(userIdStr); // Store as string for consistency
      post.Likes = post.Likes + 1;
      hasLiked = true;
      console.log(`User ${userId} liked post ${id}`);
    } else {
      // User already liked the post, so remove their like
      likedByArray.splice(userIndex, 1);
      post.Likes = Math.max(0, post.Likes - 1); // Ensure likes don't go below 0
      hasLiked = false;
      console.log(`User ${userId} unliked post ${id}`);
    }
    
    console.log("Updated LikedBy array before save:", likedByArray);
    
    // Update the post with the new LikedBy array
    post.LikedBy = likedByArray;
    
    // Save the post
    await post.save();
    
    // Verify the save worked by fetching the post again
    const updatedPost = await Post.findByPk(id);
    console.log("Post after like toggle and save:", {
      postId: updatedPost.PostID,
      likes: updatedPost.Likes,
      likedBy: updatedPost.LikedBy,
      likedByType: typeof updatedPost.LikedBy,
      isArray: Array.isArray(updatedPost.LikedBy)
    });
    
    console.log(`Post ${id} like toggled successfully, new like count: ${post.Likes}`);
    res.status(200).json({
      message: hasLiked ? "Post liked successfully" : "Post unliked successfully",
      likes: post.Likes,
      likedBy: likedByArray,
      hasLiked: hasLiked
    });
  } catch (error) {
    console.error("Error toggling post like:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Error toggling post like", error: error.message });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
   
    console.log(`Attempting to add comment to post with ID: ${id}`);
    console.log("User making request:", req.user);
    console.log("Comment content:", content);
   
    // Validate input
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: "Comment content is required" });
    }
   
    // Check if post exists
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
   
    // Create the comment
    const comment = await Comment.create({
      PostID: id,
      UserID: req.user.UserID,
      Content: content,
      CreatedDate: new Date() // Changed from CreatedAt to CreatedDate
    });
   
    console.log(`Comment added to post ${id} successfully:`, comment);
   
    // Fetch the created comment with user details
    const commentWithUser = await Comment.findByPk(comment.CommentID, {
      include: [
        {
          model: User,
          attributes: ["UserID", "Name", "Role"]
        }
      ]
    });
   
    // Format the response
    const formattedComment = {
      id: commentWithUser.CommentID,
      text: commentWithUser.Content,
      createdAt: commentWithUser.CreatedDate, // Changed from CreatedAt to CreatedDate
      author: {
        id: commentWithUser.User.UserID,
        name: commentWithUser.User.Name,
        role: commentWithUser.User.Role
      }
    };
   
    res.status(201).json(formattedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error adding comment",
      error: error.message,
      stack: error.stack
    });
  }
};

// Get all comments for a post
exports.getPostComments = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting comments for post with ID: ${id}`);
   
    const comments = await Comment.findAll({
      where: { PostID: id },
      include: [
        {
          model: User,
          attributes: ["UserID", "Name", "Role"]
        }
      ],
      order: [["CreatedDate", "ASC"]] // Changed from CreatedAt to CreatedDate
    });
   
    console.log(`Found ${comments.length} comments for post ${id}`);
   
    // Format the comments for response
    const formattedComments = comments.map(comment => ({
      id: comment.CommentID,
      text: comment.Content,
      createdAt: comment.CreatedDate, // Changed from CreatedAt to CreatedDate
      author: {
        id: comment.User.UserID,
        name: comment.User.Name,
        role: comment.User.Role
      }
    }));
   
    res.status(200).json(formattedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error fetching comments",
      error: error.message
    });
  }
};

// Delete a comment (only comment owner or admin can delete)
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    console.log(`Attempting to delete comment ${commentId} from post ${postId}`);
    console.log("User making request:", req.user);
   
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
   
    // Check if user is comment owner or admin
    if (comment.UserID !== req.user.UserID && req.user.Role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own comments" });
    }
   
    await comment.destroy();
    console.log(`Comment ${commentId} deleted successfully`);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};

// Add a debug endpoint to check post structure
exports.debugPostStructure = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Debug request for post with ID: ${id}`);
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Get the raw post data
    const rawPost = post.toJSON();
    
    // Check LikedBy field specifically
    const likedByInfo = {
      exists: post.LikedBy !== undefined,
      type: typeof post.LikedBy,
      isArray: Array.isArray(post.LikedBy),
      value: post.LikedBy,
      rawValue: rawPost.LikedBy
    };
    
    // Return detailed debug info
    res.status(200).json({
      message: "Post debug info",
      post: rawPost,
      likedByInfo: likedByInfo,
      sequelizeDataValues: post.dataValues,
      modelDefinition: Post.rawAttributes
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Error in debug endpoint", 
      error: error.message,
      stack: error.stack
    });
  }
};


