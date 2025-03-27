import React, { useState, useEffect, useContext, useRef } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import RightSidebar from '../../components/rightSidebar';
import Sidebar from "../../components/sidebar";
import apiService from '../../services/apiService';

// Import new components
import DebugPanel from '../../components/social/DebugPanel';
import CreatePostForm from '../../components/social/CreatePostForm';
import PostList from '../../components/social/PostList';

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

  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
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

  // Initial load of posts - only once when authenticated
  useEffect(() => {
    const loadInitialPosts = async () => {
      if (isAuthenticated && !initialLoadDone) {
        console.log("Loading posts for the first time...");
        try {
          await fetchPosts();
          setInitialLoadDone(true);
          setDebugInfo(prev => ({...prev, initialLoad: 'Success'}));
        } catch (err) {
          console.error("Error in initial post loading:", err);
          setError('Failed to load posts. Please try again.');
          setDebugInfo(prev => ({...prev, initialLoadError: err.message}));
        }
      }
    };

    loadInitialPosts();
  }, [isAuthenticated, initialLoadDone, fetchPosts]);

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

  // Manual refresh button handler
  const handleManualRefresh = () => {
    handleRefresh();
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
      <div className="flex h-full">
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
            {/* Debug panel component */}
            <DebugPanel 
              debugInfo={debugInfo}
              error={error}
              isAuthenticated={isAuthenticated}
              user={user}
              posts={posts}
              isLoadingPosts={isLoadingPosts}
              isRefreshing={isRefreshing}
              authError={authError}
              handleTestAuth={handleTestAuth}
              checkCookie={checkCookie}
              handleRefresh={handleManualRefresh}
            />

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
                    posts={posts} 
                    isLoadingPosts={isLoadingPosts} 
                    isRefreshing={isRefreshing}
                    onLikePost={handleLikePost}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Socials;
