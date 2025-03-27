import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

function CommentList({ comments, currentUser, postId, onEditComment, onDeleteComment, onCommentsChange }) {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [localComments, setLocalComments] = useState(comments);

  // Update local comments when props change
  React.useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  console.log("Comments data:", localComments);
  console.log("Current user:", currentUser);
  console.log("Comment handlers:", { onEditComment, onDeleteComment });

  // Check if current user can modify a comment
  const canModifyComment = (comment) => {
    if (!currentUser) return false;
    
    // Check if author.id matches current user's ID or if user is Admin
    return currentUser.UserID === comment.author?.id || currentUser.Role === 'Admin';
  };

  // Handle edit comment submission
  const handleEditCommentSubmit = (commentId) => {
    if (typeof onEditComment === 'function') {
      console.log("Submitting edited comment:", {
        postId,
        commentId,
        content: editCommentContent
      });
      
      onEditComment(postId, commentId, editCommentContent)
        .then(response => {
          console.log("Comment edit successful:", response);
          
          // Update the local comments state
          const updatedComments = localComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, text: editCommentContent } 
              : comment
          );
          setLocalComments(updatedComments);
          
          // Notify parent component about the change
          if (typeof onCommentsChange === 'function') {
            onCommentsChange(updatedComments);
          }
          
          setEditingCommentId(null);
          setEditCommentContent('');
        })
        .catch(error => {
          console.error("Comment edit failed:", error);
          alert(`Failed to edit comment: ${error.message || 'Unknown error'}`);
        });
    } else {
      console.error('onEditComment is not a function');
      alert('Sorry, comment editing is not available right now.');
    }
  };

  // Handle delete comment
  const handleDeleteComment = (commentId) => {
    if (typeof onDeleteComment !== 'function') {
      console.error('onDeleteComment is not a function');
      alert('Sorry, comment deletion is not available right now.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this comment?')) {
      console.log("Deleting comment:", {
        postId,
        commentId
      });
      
      onDeleteComment(postId, commentId)
        .then(() => {
          console.log("Comment delete successful");
          
          // Update the local comments state
          const updatedComments = localComments.filter(comment => comment.id !== commentId);
          setLocalComments(updatedComments);
          
          // Notify parent component about the change
          if (typeof onCommentsChange === 'function') {
            onCommentsChange(updatedComments);
          }
        })
        .catch(error => {
          console.error("Comment delete failed:", error);
          alert(`Failed to delete comment: ${error.message || 'Unknown error'}`);
        });
    }
  };

  // Start editing a comment
  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.text);
  };

  if (!localComments || !Array.isArray(localComments) || localComments.length === 0) {
    return <p className="text-gray-500 text-sm mt-2">No comments yet.</p>;
  }

  return (
    <div className="mt-3">
      {localComments.map((comment, index) => {
        // Debug each comment to see its structure
        console.log(`Comment ${index}:`, comment);
        
        return (
          <div key={comment.id || `comment-${index}`} className="mb-3 pb-3 border-b last:border-b-0">
            <div className="flex justify-between">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="ml-2">
                  <div className="flex items-center">
                    <p className="font-semibold text-sm">{comment.author?.name || 'Unknown'}</p>
                    <span className="text-gray-500 text-xs ml-2">
                      {comment.author?.role || 'User'} • {
                        comment.createdAt
                          ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                          : 'recently'
                      }
                    </span>
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="mt-1">
                      <textarea
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                      <div className="flex space-x-2 mt-1">
                        <button
                          onClick={() => handleEditCommentSubmit(comment.id)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm">{comment.text}</p>
                  )}
                </div>
              </div>
              
              {/* Edit/Delete buttons for comment */}
              {canModifyComment(comment) && editingCommentId !== comment.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditingComment(comment)}
                    className="text-blue-500 hover:text-blue-700 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CommentList;
