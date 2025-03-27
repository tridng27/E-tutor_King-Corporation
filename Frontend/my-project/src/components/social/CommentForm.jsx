import React, { useState, useEffect } from 'react';

function CommentForm({
  postId,
  commentId = null,
  initialText = '',
  onSubmitComment,
  onCancelEdit = null,
  isSubmitting,
  isEditing = false
}) {
  const [commentText, setCommentText] = useState(initialText);

  // Update the text field when initialText changes (for editing)
  useEffect(() => {
    setCommentText(initialText);
  }, [initialText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    if (typeof onSubmitComment !== 'function') {
      console.error('onSubmitComment is not a function');
      alert('Sorry, commenting is not available right now.');
      return;
    }
    
    if (isEditing && commentId) {
      // For editing existing comment
      onSubmitComment(postId, commentId, commentText);
    } else {
      // For creating new comment
      onSubmitComment(postId, commentText);
    }
    
    if (!isEditing) {
      setCommentText(''); // Clear the input after submission (only for new comments)
    }
  };

  const handleCancel = () => {
    if (typeof onCancelEdit === 'function') {
      onCancelEdit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <div className="flex flex-col">
        <div className="flex items-center">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isEditing ? "Edit your comment..." : "Write a comment..."}
            className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className={`px-4 py-2 ${
              !commentText.trim() || isSubmitting
                ? 'bg-gray-300 text-gray-500'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } ${isEditing ? 'rounded-r-none' : 'rounded-r-lg'}`}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save' : 'Post'}
          </button>
          
          {/* Cancel button for edit mode */}
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-r-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

export default CommentForm;
