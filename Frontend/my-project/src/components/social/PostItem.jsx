import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import apiService from '../../services/apiService';

function PostItem({ post, onLike, onComment, onEdit, onDelete, onEditComment, onDeleteComment, currentUser, onPostUpdate, refreshData }) {
  const [showComments, setShowComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editHashtags, setEditHashtags] = useState(post.Hashtags?.join(' ') || '');
  const [localPost, setLocalPost] = useState(post);
  const [hasLiked, setHasLiked] = useState(false);
  const [keepImage, setKeepImage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      Image
    ],
    content: '',
    editable: true,
  });

  // Debug: Log image URL when component mounts or updates
  useEffect(() => {
    console.log("Post image URL:", {
      postId: post.PostID,
      imageURL: post.ImageURL,
      localPostImageURL: localPost.ImageURL
    });
  }, [post, localPost]);

  // Update local post when props change
  useEffect(() => {
    setLocalPost(post);
    setEditHashtags(post.Hashtags?.join(' ') || '');
    setKeepImage(true); // Always default to keeping the image
  }, [post]);

  // Set editor content when entering edit mode
  useEffect(() => {
    if (isEditing && editor) {
      editor.commands.setContent(localPost.Content);
      console.log("Entering edit mode with image:", localPost.ImageURL);
    }
  }, [isEditing, localPost.Content, editor]);

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
    }
  }, [localPost, currentUser]);

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
      const result = await onComment(postId, commentText);
      
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

  // Add image to editor
  const addImage = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
   
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          // Create a FormData instance
          const formData = new FormData();
          formData.append('image', file);
          
          // Use the apiService
          const response = await apiService.post('/upload/image', formData);
          
          // Get the image URL from the response
          const imageUrl = response.data.url;
          
          // Insert the image into the editor
          editor.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error) {
          console.error('Error uploading image:', error);
          alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
        }
      }
    };
  };

  // Handle edit post submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (typeof onEdit !== 'function') {
      console.error('onEdit is not a function');
      alert('Sorry, post editing is not available right now.');
      setIsEditing(false);
      return;
    }
    
    if (!editor) {
      console.error('Editor not initialized');
      alert('Sorry, the editor is not ready. Please try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Convert hashtags string to array
    const hashtagsArray = editHashtags
      .split(' ')
      .map(tag => tag.trim().replace(/^#/, '')) // Remove # prefix if present
      .filter(tag => tag.length > 0); // Remove empty tags
    
    // Get content from editor
    const content = editor.getHTML();
    
    // Determine image URL based on keepImage flag
    const imageURL = keepImage ? localPost.ImageURL : null;
    
    console.log("Submitting edited post:", {
      postId: localPost.PostID,
      content: content,
      hashtags: hashtagsArray,
      imageURL: imageURL,
      keepImage: keepImage
    });
    
    onEdit(localPost.PostID, {
      content: content,
      hashtags: hashtagsArray,
      imageURL: imageURL
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
    })
    .finally(() => {
      setIsSubmitting(false);
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
      onDelete(localPost.PostID)
        .then(() => {
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
    
    onLike(localPost.PostID)
      .then(response => {
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

  // Extract image URL from HTML content if it exists
  const extractImageFromContent = () => {
    if (!localPost.Content) return null;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = localPost.Content;
    const imgElement = tempDiv.querySelector('img');
    return imgElement ? imgElement.src : null;
  };

  // Get image URL from either ImageURL property or embedded in content
  const getPostImageUrl = () => {
    return localPost.ImageURL || extractImageFromContent();
  };

  const imageUrl = getPostImageUrl();

  // Font families for the editor
  const fontFamilies = [
    { name: 'Default', value: 'Inter, system-ui, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
    { name: 'Courier New', value: '"Courier New", monospace' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
  ];

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
        
        {/* Edit/Delete buttons for post */}
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
        // Rich Text Edit form
        <form onSubmit={handleEditSubmit} className="mb-3">
          <div className="mb-3 rounded-lg overflow-hidden shadow-sm">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b">
              {/* Font Family Dropdown */}
              <select
                onChange={(e) => {
                  editor.chain().focus().setFontFamily(e.target.value).run();
                }}
                className="px-2 py-1 rounded border border-gray-300 text-sm"
              >
                <option value="">Font Family</option>
                {fontFamilies.map((font) => (
                  <option key={font.name} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
             
              {/* Text Formatting Buttons */}
              <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                className={`px-2 py-1 rounded text-sm ${
                                  editor?.isActive('bold')
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-white border border-gray-300'
                                }`}
                              >
                                Bold
                              </button>
                              <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                className={`px-2 py-1 rounded text-sm ${
                                  editor?.isActive('italic')
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-white border border-gray-300'
                                }`}
                              >
                                Italic
                              </button>
                             
                              {/* Text Color Dropdown */}
                              <select
                                onChange={(e) => {
                                  editor.chain().focus().setColor(e.target.value).run();
                                }}
                                className="px-2 py-1 rounded border border-gray-300 text-sm"
                              >
                                <option value="">Text Color</option>
                                <option value="#000000" style={{ color: '#000000' }}>Black</option>
                                <option value="#FF0000" style={{ color: '#FF0000' }}>Red</option>
                                <option value="#0000FF" style={{ color: '#0000FF' }}>Blue</option>
                                <option value="#008000" style={{ color: '#008000' }}>Green</option>
                                <option value="#FFA500" style={{ color: '#FFA500' }}>Orange</option>
                                <option value="#800080" style={{ color: '#800080' }}>Purple</option>
                              </select>
                             
                              {/* Image Button */}
                              <button
                                type="button"
                                onClick={addImage}
                                className="px-2 py-1 rounded text-sm bg-white border border-gray-300"
                              >
                                Add Image
                              </button>
                            </div>
                           
                            {/* Editor Content Area */}
                            <EditorContent
                              editor={editor}
                              className="p-3 min-h-[150px] focus:outline-none"
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
                          
                          {/* Show image in edit mode if it exists */}
                          {imageUrl && !editor?.getHTML().includes(imageUrl) && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">Current Image:</label>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="keepImage"
                                    checked={keepImage}
                                    onChange={(e) => setKeepImage(e.target.checked)}
                                    className="mr-2"
                                  />
                                  <label htmlFor="keepImage" className="text-sm text-gray-600">
                                    Keep this image
                                  </label>
                                </div>
                              </div>
                              {keepImage && (
                                <img
                                  src={imageUrl}
                                  alt="Post"
                                  className="w-full h-48 object-cover mt-2 rounded-lg"
                                />
                              )}
                            </div>
                          )}
                          
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
                              disabled={isSubmitting || !editor?.getText().trim()}
                              className={`px-3 py-1 ${
                                isSubmitting || !editor?.getText().trim()
                                  ? 'bg-blue-300'
                                  : 'bg-blue-500 hover:bg-blue-600'
                              } text-white rounded-lg`}
                            >
                              {isSubmitting ? 'Saving...' : 'Save Changes'}
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
                          
                          {localPost.ImageURL && !localPost.Content.includes(localPost.ImageURL) && (
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
                