import React from 'react';
import PostItem from './PostItem';

function PostList({ posts, isLoadingPosts, isRefreshing, onLikePost }) {
  if (isLoadingPosts && !isRefreshing) {
    return <div className="text-center py-4">Loading posts...</div>;
  }
  
  if (posts.length === 0) {
    return <div className="text-center py-4">No posts yet. Be the first to post!</div>;
  }
  
  return (
    <div>
      {posts.map((post) => (
        <PostItem 
          key={post.PostID} 
          post={post} 
          onLike={onLikePost} 
        />
      ))}
    </div>
  );
}

export default PostList;
