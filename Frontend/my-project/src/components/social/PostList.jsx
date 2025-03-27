import React from 'react';
import PostItem from './PostItem';

function PostList({
  posts,
  isLoadingPosts,
  isRefreshing,
  onLikePost,
  onCommentPost,
  onEditPost,
  onDeletePost,
  onEditComment,
  onDeleteComment,
  onPostUpdate,  // Existing prop
  refreshData,   // New prop for refreshing data
  currentUser
}) {
  // Debug: Log props to see what's being passed
  console.log("PostList props:", {
    postsCount: posts?.length,
    isLoadingPosts,
    isRefreshing,
    handlers: {
      onLikePost: typeof onLikePost === 'function',
      onCommentPost: typeof onCommentPost === 'function',
      onEditPost: typeof onEditPost === 'function',
      onDeletePost: typeof onDeletePost === 'function',
      onEditComment: typeof onEditComment === 'function',
      onDeleteComment: typeof onDeleteComment === 'function',
      onPostUpdate: typeof onPostUpdate === 'function',
      refreshData: typeof refreshData === 'function'  // Log the new handler
    },
    currentUser: currentUser ? `${currentUser.Name} (${currentUser.Role})` : 'Not logged in'
  });

  if (isLoadingPosts && !isRefreshing) {
    return <div className="text-center py-4">Loading posts...</div>;
  }
 
  if (!posts || posts.length === 0) {
    return <div className="text-center py-4">No posts yet. Be the first to post!</div>;
  }
 
  return (
    <div>
      {posts.map((post) => (
        <PostItem
          key={post.PostID}
          post={post}
          onLike={onLikePost}
          onComment={onCommentPost}
          onEdit={onEditPost}
          onDelete={onDeletePost}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          onPostUpdate={onPostUpdate}  // Existing prop
          refreshData={refreshData}    // Pass the new refresh function prop
          currentUser={currentUser}
        />
      ))}
    </div>
  );
}

export default PostList;
