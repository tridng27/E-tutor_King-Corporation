import React, { useState, useEffect, useContext, useRef } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import RightSidebar from '../../components/rightSidebar';
import Sidebar from "../../components/sidebar";
import { formatDistanceToNow } from 'date-fns';
import apiService from '../../services/apiService';

function Socials() {
  const {
    user,
    isAuthenticated,
    posts,
    isLoadingPosts,
    fetchPosts,
    createPost,
    likePost,
    authError
  } = useContext(GlobalContext);

  const [postContent, setPostContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const contentRef = useRef(null);

  // Debug: Log context values
  useEffect(() => {
    console.log("Context values:", {
      isAuthenticated,
      postsCount: posts?.length,
      isLoadingPosts,
      user: user ? `${user.Name} (${user.Role})` : 'Not logged in',
      authError
    });
   
    // Update debug info
    setDebugInfo({
      isAuthenticated,
      postsCount: posts?.length,
      isLoadingPosts,
      user: user ? `${user.Name} (${user.Role})` : 'Not logged in',
      authError: authError || 'None'
    });
  }, [isAuthenticated, posts, isLoadingPosts, user, authError]);

  // Fetch posts when component mounts
  useEffect(() => {
    console.log("useEffect triggered, isAuthenticated:", isAuthenticated);
    if (isAuthenticated) {
      console.log("Fetching posts...");
      fetchPosts()
        .then(result => {
          console.log("Posts fetched successfully:", result);
          setDebugInfo(prev => ({...prev, fetchResult: 'Success', postsCount: result.length}));
        })
        .catch(err => {
          console.error("Error fetching posts in component:", err);
          setError('Failed to load posts. Please try again.');
          setDebugInfo(prev => ({...prev, fetchError: err.message}));
        });
    }
  }, [isAuthenticated, fetchPosts]);

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

  const handleRefresh = async () => {
    if (isRefreshing || !isAuthenticated) return;
    
    setIsRefreshing(true);
    setDebugInfo(prev => ({...prev, refreshStatus: 'Refreshing...'}));
    
    try {
      await fetchPosts();
      setDebugInfo(prev => ({...prev, refreshStatus: 'Success', lastRefresh: new Date().toLocaleTimeString()}));
    } catch (err) {
      console.error("Error refreshing posts:", err);
      setError('Failed to refresh posts. Please try again.');
      setDebugInfo(prev => ({...prev, refreshError: err.message}));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    console.log("Submit post triggered with content:", postContent);
    if (!postContent.trim()) {
      console.log("Post content is empty, not submitting");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Process hashtags from input (e.g., "#learning #coding" -> ["learning", "coding"])
      const hashtagArray = hashtags
        .split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.substring(1));
     
      console.log("Processed hashtags:", hashtagArray);

      // Create post data
      const postData = {
        content: postContent,
        hashtags: hashtagArray
      };
     
      console.log("Submitting post data:", postData);
      const result = await createPost(postData);
      console.log("Post creation result:", result);
     
      // Reset form
      setPostContent('');
      setHashtags('');
      setDebugInfo(prev => ({...prev, lastPostResult: 'Success', lastPostId: result?.post?.PostID}));
     
      // No need to manually fetch posts again - the createPost function should update the state
    } catch (error) {
      console.error('Error creating post:', error);
      setError(`Failed to create post: ${error.message || 'Unknown error'}`);
      setDebugInfo(prev => ({...prev, lastPostError: error.message}));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    console.log("Liking post with ID:", postId);
    try {
      const result = await likePost(postId);
      console.log("Like post result:", result);
    } catch (error) {
      console.error('Error liking post:', error);
      setError(`Failed to like post: ${error.message || 'Unknown error'}`);
    }
  };

  // Test authentication function
  const handleTestAuth = async () => {
    try {
      setDebugInfo(prev => ({...prev, authTestStatus: 'Testing...'}));
      const response = await apiService.get('/auth/me');
      console.log("Auth test result:", response.data);
      setDebugInfo(prev => ({
        ...prev,
        authTestStatus: 'Success',
        authTestResult: JSON.stringify(response.data)
      }));
    } catch (error) {
      console.error("Auth test failed:", error);
      setDebugInfo(prev => ({
        ...prev,
        authTestStatus: 'Failed',
        authTestError: error.message
      }));
    }
  };

  // Function to check cookie
  const checkCookie = () => {
    setDebugInfo(prev => ({
      ...prev,
      cookieCheck: 'Cookies are HttpOnly and cannot be accessed via JavaScript. Check Network tab in DevTools.'
    }));
  };

  return (
    <div className="relative">
      <div className="flex h-screen">
        <Sidebar />

        <div 
          ref={contentRef}
          className="flex-1 p-6 ml-16 overflow-y-auto"
        >
          {/* Pull to refresh indicator */}
          {isRefreshing && (
            <div className="sticky top-0 bg-blue-100 text-blue-800 text-center py-2 rounded-md mb-4 z-10">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Refreshing posts...
            </div>
          )}
          
          <div className="max-w-2xl mx-auto">
            {/* Debug panel */}
            <div className="bg-yellow-100 p-4 mb-4 rounded text-xs">
              <h3 className="font-bold text-sm mb-2">Debug Panel</h3>
             
              <div className="flex space-x-2 mb-2">
                <button
                  onClick={handleTestAuth}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Test Auth
                </button>
                <button
                  onClick={checkCookie}
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                >
                  Check Cookie
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`px-2 py-1 ${isRefreshing ? 'bg-gray-400' : 'bg-purple-500'} text-white rounded text-xs`}
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh Posts'}
                </button>
              </div>
             
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p><strong>Auth:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>User:</strong> {user ? `${user.Name} (${user.Role})` : 'Not logged in'}</p>
                  <p><strong>Posts:</strong> {posts?.length || 0}</p>
                  <p><strong>Loading:</strong> {isLoadingPosts ? '⏳ Yes' : '✅ No'}</p>
                  <p><strong>Refreshing:</strong> {isRefreshing ? '⏳ Yes' : '✅ No'}</p>
                  {authError && <p className="text-red-600"><strong>Auth Error:</strong> {authError}</p>}
                </div>
                <div>
                  {Object.entries(debugInfo).map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {value}</p>
                  ))}
                </div>
              </div>
             
              {error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                  <p className="text-red-700"><strong>Error:</strong> {error}</p>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <form onSubmit={handleSubmitPost}>
                  <input
                    type="text"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What's on your mind right now?"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="Add hashtags (e.g. #learning #coding)"
                    className="w-full p-2 border rounded-lg focus:outline-none mt-2"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !postContent.trim()}
                      className={`px-4 py-2 rounded-lg text-white ${
                        isSubmitting || !postContent.trim()
                          ? 'bg-blue-300'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!isAuthenticated && (
              <div className="bg-yellow-50 p-4 rounded-lg shadow-md mb-4 text-center">
                <p className="text-yellow-700">Please log in to create and view posts.</p>
              </div>
            )}

            {/* Pull to refresh instruction */}
            {isAuthenticated && posts.length > 0 && (
              <div className="text-center text-gray-500 text-sm mb-4">
                Scroll up to refresh posts
              </div>
            )}

            {isLoadingPosts && !isRefreshing ? (
              <div className="text-center py-4">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-4">No posts yet. Be the first to post!</div>
            ) : (
              posts.map((post) => (
                <div key={post.PostID} className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="ml-2">
                      <p className="font-semibold">{post.User?.Name || 'Unknown User'}</p>
                      <p className="text-gray-500 text-sm">
                        {post.User?.Role || 'User'} • {
                          post.CreatedAt
                            ? formatDistanceToNow(new Date(post.CreatedAt), { addSuffix: true })
                            : 'recently'
                        }
                      </p>
                    </div>
                  </div>
                 
                  <p className="text-gray-700">{post.Content}</p>
                 
                  {Array.isArray(post.Hashtags) && post.Hashtags.length > 0 && (
                    <p className="text-blue-500 text-sm mt-1">
                      {post.Hashtags.map(tag => `#${tag}`).join(' ')}
                    </p>
                  )}
                 
                  {post.ImageURL && (
                    <img
                      src={post.ImageURL}
                      alt="Post"
                      className="w-full h-48 object-cover mt-2 rounded-lg"
                    />
                  )}
                 
                  <div className="flex justify-between text-gray-500 text-sm mt-3">
                    <button
                      onClick={() => handleLikePost(post.PostID)}
                      className="flex items-center hover:text-blue-500"
                    >
                      ❤️ {post.Likes || 0} Likes
                    </button>
                    <div className="flex items-center">💬 {post.Comments?.length || 0} Comments</div>
                    <div className="flex items-center">🔁 {post.Shares || 0} Shares</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <RightSidebar />
      </div>
    </div>
  );
}

export default Socials;
