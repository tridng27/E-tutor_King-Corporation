import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

function PostItem({ post, onLike, onComment, onEdit, onDelete, onEditComment, onDeleteComment, currentUser, onPostUpdate, refreshData }) {
  const [showComments, setShowComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.Content);
  const [editHashtags, setEditHashtags] = useState(post.Hashtags?.join(' ') || '');
  const [localPost, setLocalPost] = useState(post);
  const [hasLiked, setHasLiked] = useState(false);

  // Update local post when props change
  useEffect(() => {
    setLocalPost(post);
    setEditContent(post.Content);
    setEditHashtags(post.Hashtags?.join(' ') || '');
  }, [post]);

  // Check if user has liked this post
  useEffect(() => {
    if (currentUser && localPost) {
      // Get user ID as string for comparison
      const userIdStr = String(currentUser.UserID);
      
      // Check if LikedBy exists and contains user ID
      const likedByArray = localPost.LikedBy || [];
      const userHasLiked = Array.isArray(likedByArray) && 
        likedByArray.includes(userIdStr);
      
      setHasLiked(userHasLiked);
      
      console.log("Like status check:", {
        userId: userIdStr,
        likedBy: likedByArray,
        hasLiked: userHasLiked
      });
    }
  }, [localPost, currentUser]);

  // Debug: Log props to see what's being passed
  useEffect(() => {
    console.log("PostItem props:", {
      postId: post.PostID,
      postUserId: post.UserID,
      currentUserId: currentUser?.UserID,
      currentUserRole: currentUser?.Role,
      likedBy: post.LikedBy,
      canModify: currentUser && (
        currentUser.UserID === post.UserID ||
        currentUser.Role === 'Admin'
      ),
      handlers: {
        onLike: typeof onLike === 'function',
        onComment: typeof onComment === 'function',
        onEdit: typeof onEdit === 'function',
        onDelete: typeof onDelete === 'function',
        onEditComment: typeof onEditComment === 'function',
        onDeleteComment: typeof onDeleteComment === 'function',
        onPostUpdate: typeof onPostUpdate === 'function',
        refreshData: typeof refreshData === 'function'
      }
    });
  }, [post, currentUser, onLike, onComment, onEdit, onDelete, onEditComment, onDeleteComment, onPostUpdate, refreshData]);

  // Function to safely render sanitized HTML content
  const renderSanitizedHTML = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  // Handle comment submission
  const handleSubmitComment = async (postId, commentText) => {
    if (typeof onComment !== 'function') {
      console.error('onComment is not a function');
      alert('Sorry, commenting is not available right now.');
      return;
    }
    
    setIsSubmittingComment(true);
    try {
      console.log("Submitting comment:", {
        postId,
        commentText
      });
      
      const result = await onComment(postId, commentText);
      console.log("Comment submitted successfully:", result);
      
      // Update local post with the new comment
      const updatedComments = [...(localPost.Comments || []), result];
      const updatedPost = {
        ...localPost,
        Comments: updatedComments
      };
      setLocalPost(updatedPost);
      
      // Notify parent component about the update
      if (typeof onPostUpdate === 'function') {
        onPostUpdate(updatedPost);
      }
      
      // Refresh data if available
      if (typeof refreshData === 'function') {
        refreshData();
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert(`Failed to submit comment: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle comments change (edit/delete)
  const handleCommentsChange = (updatedComments) => {
    // Create a copy of the post with updated comments
    const updatedPost = {
      ...localPost,
      Comments: updatedComments
    };
    
    // Update local state
    setLocalPost(updatedPost);
    
    // Notify parent component about the update
    if (typeof onPostUpdate === 'function') {
      onPostUpdate(updatedPost);
    }
    
    // Refresh data if available
    if (typeof refreshData === 'function') {
      refreshData();
    }
  };

  // Toggle comments visibility
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // Check if current user can edit/delete this post
  const canModifyPost = currentUser && (
    currentUser.UserID === localPost.UserID ||
    currentUser.Role === 'Admin'
  );

  // Handle edit post submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (typeof onEdit !== 'function') {
      console.error('onEdit is not a function');
      alert('Sorry, post editing is not available right now.');
      setIsEditing(false);
      return;
    }
    
    // Convert hashtags string to array
    const hashtagsArray = editHashtags
      .split(' ')
      .map(tag => tag.trim().replace(/^#/, '')) // Remove # prefix if present
      .filter(tag => tag.length > 0); // Remove empty tags
    
    console.log("Submitting edited post:", {
      postId: localPost.PostID,
      content: editContent,
      hashtags: hashtagsArray,
      imageURL: localPost.ImageURL
    });
    
    onEdit(localPost.PostID, {
      content: editContent,
      hashtags: hashtagsArray,
      imageURL: localPost.ImageURL // Keep the existing image URL
    })
    .then(response => {
      console.log("Post edit successful:", response);
      
      // Update local post with the edited content
      if (response && response.post) {
        // Preserve LikedBy if it's missing in the response
        if (!response.post.LikedBy && localPost.LikedBy) {
          response.post.LikedBy = localPost.LikedBy;
        }
        
        setLocalPost(response.post);
        
        // Notify parent component about the update
        if (typeof onPostUpdate === 'function') {
          onPostUpdate(response.post);
        }
      }
      
      setIsEditing(false);
      
      // Refresh data if available
      if (typeof refreshData === 'function') {
        refreshData();
      }
    })
    .catch(error => {
      console.error("Post edit failed:", error);
      alert(`Failed to edit post: ${error.message || 'Unknown error'}`);
    });
  };

  // Handle delete post
  const handleDelete = () => {
    if (typeof onDelete !== 'function') {
      console.error('onDelete is not a function');
      alert('Sorry, post deletion is not available right now.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      console.log("Deleting post:", localPost.PostID);
      
      onDelete(localPost.PostID)
        .then(() => {
          console.log("Post deleted successfully");
          
          // Notify parent component about the deletion
          if (typeof onPostUpdate === 'function') {
            // Pass null or a special flag to indicate deletion
            onPostUpdate({ ...localPost, _deleted: true });
          }
          
          // Refresh data if available
          if (typeof refreshData === 'function') {
            refreshData();
          }
        })
        .catch(error => {
          console.error("Post delete failed:", error);
          alert(`Failed to delete post: ${error.message || 'Unknown error'}`);
        });
    }
  };

  // Handle like post
  const handleLike = () => {
    if (typeof onLike !== 'function') {
      console.error('onLike is not a function');
      alert('Sorry, liking posts is not available right now.');
      return;
    }
    
    console.log("Liking post:", localPost.PostID);
    
    onLike(localPost.PostID)
      .then(response => {
        console.log("Post like action successful:", response);
        
        // Update local post with the new like count and LikedBy array
        if (response) {
          // Create a new LikedBy array if it doesn't exist
          let newLikedBy = response.likedBy || [];
          
          // Ensure it's an array
          if (!Array.isArray(newLikedBy)) {
            newLikedBy = [];
          }
          
          const updatedPost = {
            ...localPost,
            Likes: response.likes,
            LikedBy: newLikedBy
          };
          
          setLocalPost(updatedPost);
          setHasLiked(response.hasLiked);
          
          console.log("Updated local post:", updatedPost);
          
          // Notify parent component about the update
          if (typeof onPostUpdate === 'function') {
            onPostUpdate(updatedPost);
          }
        }
      })
      .catch(error => {
        console.error("Post like failed:", error);
        alert(`Failed to like post: ${error.message || 'Unknown error'}`);
      });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="ml-2">
            <p className="font-semibold">{localPost.User?.Name || 'Unknown User'}</p>
            <p className="text-gray-500 text-sm">
              {localPost.User?.Role || 'User'} • {
                localPost.CreatedAt
                  ? formatDistanceToNow(new Date(localPost.CreatedAt), { addSuffix: true })
                  : 'recently'
              }
            </p>
          </div>
        </div>
        
        {/* Edit/Delete buttons for post with debug info */}
        <div>
          {canModifyPost ? (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="text-xs text-gray-400">
              {currentUser ? 'Not your post' : 'Login to edit'}
            </div>
          )}
        </div>
      </div>
      
      {isEditing ? (
        // Edit form
        <form onSubmit={handleEditSubmit} className="mb-3">
          <div className="mb-3">
            <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <input
                            type="text"
                            value={editHashtags}
                            onChange={(e) => setEditHashtags(e.target.value)}
                            placeholder="Hashtags (space separated)"
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    ) : (
                      // Regular post content display
                      <>
                        <div
                          className="text-gray-700"
                          dangerouslySetInnerHTML={renderSanitizedHTML(localPost.Content)}
                        ></div>
                        
                        {Array.isArray(localPost.Hashtags) && localPost.Hashtags.length > 0 && (
                          <p className="text-blue-500 text-sm mt-1">
                            {localPost.Hashtags.map(tag => `#${tag}`).join(' ')}
                          </p>
                        )}
                        
                        {localPost.ImageURL && (
                          <img
                            src={localPost.ImageURL}
                            alt="Post"
                            className="w-full h-48 object-cover mt-2 rounded-lg"
                          />
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-between text-gray-500 text-sm mt-3">
                      <button
                        onClick={handleLike}
                        className={`flex items-center ${hasLiked ? 'text-red-500' : 'hover:text-blue-500'}`}
                      >
                        {hasLiked ? '❤️' : '🤍'} {localPost.Likes || 0} {hasLiked ? 'Liked' : 'Likes'}
                      </button>
                      <button
                        onClick={toggleComments}
                        className="flex items-center hover:text-blue-500"
                      >
                        💬 {localPost.Comments?.length || 0} Comments
                      </button>
                      <div className="flex items-center">🔁 {localPost.Shares || 0} Shares</div>
                    </div>
              
                    {/* Comment section */}
                    {showComments && (
                      <div className="mt-4 border-t pt-3">
                        {/* Comment form */}
                        {currentUser && (
                          <CommentForm
                            postId={localPost.PostID}
                            onSubmitComment={handleSubmitComment}
                            isSubmitting={isSubmittingComment}
                          />
                        )}
                        
                        {/* Comment list with edit/delete functionality */}
                        <CommentList
                          comments={localPost.Comments || []}
                          currentUser={currentUser}
                          postId={localPost.PostID}
                          onEditComment={onEditComment}
                          onDeleteComment={onDeleteComment}
                          onCommentsChange={handleCommentsChange}
                        />
                      </div>
                    )}
                  </div>
                );
              }
              
              export default PostItem;
              
