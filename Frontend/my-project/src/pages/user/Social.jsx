import React, { useState, useEffect, useContext, useRef } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import RightSidebar from '../../components/rightSidebar';
import Sidebar from "../../components/sidebar";
import apiService from '../../services/apiService';
import CreatePostForm from '../../components/social/CreatePostForm';
import PostList from '../../components/social/PostList';
import SearchBar from '../../components/social/SearchBar';

function Socials() {
  const {
    user,
    isAuthenticated,
    posts,
    isLoadingPosts,
    fetchPosts,
    createPost,
    editPost,        
    deletePost,      
    likePost,
    commentOnPost,    
    editComment,      
    deleteComment,    
    authError
  } = useContext(GlobalContext);

  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
 
  // Add search state variables
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
 
  // Add local posts state to manage updates without fetching from server
  const [localPosts, setLocalPosts] = useState([]);
 
  const contentRef = useRef(null);

  // Update local posts when context posts change
  useEffect(() => {
    if (posts && posts.length > 0) {
      setLocalPosts(posts);
    }
  }, [posts]);

  // Initial load of posts - only once when authenticated
  useEffect(() => {
    const loadInitialPosts = async () => {
      if (isAuthenticated && !initialLoadDone) {
        console.log("Loading posts for the first time...");
        try {
          await fetchPosts();
          setInitialLoadDone(true);
        } catch (err) {
          console.error("Error in initial post loading:", err);
          setError('Failed to load posts. Please try again.');
        }
      }
    };

    loadInitialPosts();
  }, [isAuthenticated, initialLoadDone, fetchPosts]);

  // Filter posts based on hashtag search
  useEffect(() => {
    if (!localPosts || localPosts.length === 0) {
      setFilteredPosts([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredPosts(localPosts);
      return;
    }

    setIsSearching(true);
   
    // Search for hashtags in post hashtags array
    const searchTermLower = searchTerm.toLowerCase().replace(/^#/, ''); // Remove # if present
   
    const filtered = localPosts.filter(post => {
      // Check if post has hashtags array
      if (!post.Hashtags || !Array.isArray(post.Hashtags)) {
        return false;
      }
     
      // Check if any hashtag in the array matches the search term
      return post.Hashtags.some(tag =>
        tag.toLowerCase() === searchTermLower
      );
    });
   
    console.log("Search term:", searchTermLower);
    console.log("Filtered posts:", filtered);
   
    setFilteredPosts(filtered);
    setIsSearching(false);
  }, [localPosts, searchTerm]);

  // Handle scroll events for pull-to-refresh
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
     
      const scrollY = contentRef.current.scrollTop;
      const isScrollingUp = scrollY < lastScrollY;
     
      // If user is scrolling up and is near the top, trigger refresh
      if (isScrollingUp && scrollY < 50 && !isRefreshing && !isLoadingPosts) {
        handleRefresh();
      }
     
      setLastScrollY(scrollY);
    };
   
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }
   
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [lastScrollY, isRefreshing, isLoadingPosts]);

  // Enhanced refresh function that can be called from child components
  const handleRefresh = async () => {
    if (isRefreshing || !isAuthenticated) return;
   
    setIsRefreshing(true);
   
    try {
      console.log("Refreshing posts from server...");
      await fetchPosts();
    } catch (err) {
      console.error("Error refreshing posts:", err);
      setError('Failed to refresh posts. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Manual refresh button handler
  const handleManualRefresh = () => {
    handleRefresh();
  };

  // Handle post updates (for edits, likes, comments, etc.)
  const handlePostUpdate = (updatedPost) => {
    console.log("Post update received:", updatedPost);
   
    // Check if the post was deleted
    if (updatedPost._deleted) {
      setLocalPosts(prevPosts => prevPosts.filter(post => post.PostID !== updatedPost.PostID));
      return;
    }
   
    // Update the post in the local state
    setLocalPosts(prevPosts =>
      prevPosts.map(post =>
        post.PostID === updatedPost.PostID ? updatedPost : post
      )
    );
  };

  // Like post handler - UPDATED with proper promise handling
  const handleLikePost = async (postId) => {
    console.log("Liking post with ID:", postId);
    try {
      const result = await likePost(postId);
      console.log("Like post result:", result);
      return result; // Return for promise chaining
    } catch (error) {
      console.error('Error liking post:', error);
      setError(`Failed to like post: ${error.message || 'Unknown error'}`);
      throw error; // Re-throw for promise chaining
    }
  };

  // Add comment handler - UPDATED with proper promise handling
  const handleCommentOnPost = async (postId, commentText) => {
    console.log("Commenting on post with ID:", postId);
    try {
      const result = await commentOnPost(postId, commentText);
      console.log("Comment result:", result);
      return result; // Return for promise chaining
    } catch (error) {
      console.error('Error commenting on post:', error);
      setError(`Failed to comment on post: ${error.message || 'Unknown error'}`);
      throw error; // Re-throw for promise chaining
    }
  };

  // Edit post handler - UPDATED with proper promise handling
  const handleEditPost = async (postId, postData) => {
    console.log("Editing post with ID:", postId, "with data:", postData);
    try {
      const result = await editPost(postId, postData);
      console.log("Edit post result:", result);
      // After successful edit, refresh the posts to get the latest data
      await handleRefresh();
      return result; // Return for promise chaining
    } catch (error) {
      console.error('Error editing post:', error);
      setError(`Failed to edit post: ${error.message || 'Unknown error'}`);
      throw error; // Re-throw for promise chaining
    }
  };

  // Delete post handler - UPDATED with proper promise handling
  const handleDeletePost = async (postId) => {
    console.log("Deleting post with ID:", postId);
    try {
      await deletePost(postId);
      console.log("Post deleted successfully");
      // After successful deletion, refresh the posts to get the latest data
      await handleRefresh();
      return true; // Return something for promise chaining
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(`Failed to delete post: ${error.message || 'Unknown error'}`);
      throw error; // Re-throw for promise chaining
    }
  };

  // Edit comment handler - UPDATED with proper promise handling
  const handleEditComment = async (postId, commentId, content) => {
    console.log("Editing comment with ID:", commentId, "on post:", postId);
    try {
      const result = await editComment(postId, commentId, content);
      console.log("Edit comment result:", result);
      // After successful edit, refresh the posts to get the latest data
      await handleRefresh();
      return result; // Return for promise chaining
    } catch (error) {
      console.error('Error editing comment:', error);
      setError(`Failed to edit comment: ${error.message || 'Unknown error'}`);
      throw error; // Re-throw for promise chaining
    }
  };

  // Delete comment handler - UPDATED with proper promise handling
  const handleDeleteComment = async (postId, commentId) => {
    console.log("Deleting comment with ID:", commentId, "from post:", postId);
    try {
      await deleteComment(postId, commentId);
      console.log("Comment deleted successfully");
      // After successful deletion, refresh the posts to get the latest data
      await handleRefresh();
      return true; // Return something for promise chaining
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(`Failed to delete comment: ${error.message || 'Unknown error'}`);
      throw error; // Re-throw for promise chaining
    }
  };

  return (
    <div className="relative">
      <div className="flex h-full">
        <Sidebar />

        <div className="flex-1 ml-16 flex flex-col">
          {/* Sticky search bar at the top */}
          {isAuthenticated && (
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isSearching={isSearching}
              resultsCount={filteredPosts.length}
            />
          )}

          {/* Scrollable content area */}
          <div
            ref={contentRef}
            className="flex-1 p-6 overflow-y-auto"
          >
            {/* Pull to refresh indicator */}
            {isRefreshing && (
              <div className="bg-blue-100 text-blue-800 text-center py-2 rounded-md mb-4">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                Refreshing posts...
              </div>
            )}
           
            <div className="max-w-2xl mx-auto">
              {/* Post creation form */}
              {isAuthenticated ? (
                <CreatePostForm createPost={createPost} />
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg shadow-md mb-4 text-center">
                  <p className="text-yellow-700">Please log in to create and view posts.</p>
                </div>
              )}

              {/* Manual refresh button */}
              {isAuthenticated && (
                <div className="text-center mb-4">
                  <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing || isLoadingPosts}
                    className={`px-4 py-2 rounded-lg text-white ${
                      isRefreshing || isLoadingPosts
                        ? 'bg-gray-400'
                        : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      >
                        {isRefreshing ? 'Refreshing...' : 'Refresh Posts'}
                      </button>
                      <p className="text-gray-500 text-sm mt-2">
                        Or scroll up to refresh posts
                      </p>
                    </div>
                  )}
    
                  {/* Post list component */}
                  {isAuthenticated && (
                    <>
                      {!initialLoadDone && isLoadingPosts ? (
                        <div className="text-center py-4">Loading posts for the first time...</div>
                      ) : (
                        <PostList
                          posts={searchTerm ? filteredPosts : localPosts}
                          isLoadingPosts={isLoadingPosts}
                          isRefreshing={isRefreshing}
                          onLikePost={handleLikePost}
                          onCommentPost={handleCommentOnPost}
                          onEditPost={handleEditPost}
                          onDeletePost={handleDeletePost}
                          onEditComment={handleEditComment}
                          onDeleteComment={handleDeleteComment}
                          onPostUpdate={handlePostUpdate}
                          refreshData={handleRefresh} // Pass the refresh function to PostList
                          currentUser={user}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    export default Socials;
