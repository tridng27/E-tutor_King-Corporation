import { createContext, useState, useEffect } from "react";
import apiService from "../services/apiService";

export const GlobalContext = createContext(null);

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [posts, setPosts] = useState([]); // Add this for social posts
  const [isLoadingPosts, setIsLoadingPosts] = useState(false); // Add this for loading state
  const [authError, setAuthError] = useState(null);

  // Check for user authentication on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("Checking authentication status...");
        const response = await apiService.get("/auth/me");
        const userData = response.data.user;
        
        console.log("User authenticated:", userData);
        setUser(userData);
        setUserRole(userData.Role);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.log("Not authenticated or error:", error.message);
        // If the request fails, the user is not authenticated
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      }
    };
    
    // Execute the check
    checkAuthStatus();
  }, []);
  
  // Hàm đăng nhập - now uses cookies instead of JWT in localStorage
  const login = (userData) => {
    try {
      console.log("Setting user data after login:", userData);
      setUser(userData);
      setUserRole(userData.Role);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userData));
      setAuthError(null);
    } catch (error) {
      console.error("Error processing login:", error);
      setAuthError("Failed to process login");
    }
  };

  // Hàm đăng xuất - now clears the cookie via API call
  const logout = async () => {
    try {
      console.log("Logging out...");
      await apiService.post("/auth/logout");
    } catch (error) {
      console.error("Error during logout API call:", error);
    } finally {
      // Always clear local state even if API call fails
      setUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      console.log("User logged out");
    }
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return userRole === requiredRole;
  };

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      console.log("Fetching posts...");
      
      const response = await apiService.get("/posts");
      
      console.log(`Fetched ${response.data.length} posts`);
      setPosts(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      console.error("Response data:", error.response?.data);
      
      if (error.response && error.response.status === 401) {
        console.log("Authentication error when fetching posts");
        setAuthError("Please log in to view posts");
      }
      throw error;
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Create a new post
  const createPost = async (postData) => {
    try {
      console.log("Creating post with data:", postData);
      
      const response = await apiService.post("/posts", postData);
      
      console.log("Post creation successful:", response.data);
      
      // Add the new post to the state
      setPosts(prevPosts => [response.data.post, ...prevPosts]);
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      console.error("Response data:", error.response?.data);
      
      if (error.response && error.response.status === 401) {
        console.log("Authentication error when creating post");
        setAuthError("Please log in to create posts");
        
        // Check if we're still authenticated
        try {
          await apiService.get("/auth/me");
          console.log("User is still authenticated despite 401 error");
        } catch (authError) {
          if (authError.response && [401, 404].includes(authError.response.status)) {
            console.log("Authentication verification failed, user is not authenticated");
            setUser(null);
            setUserRole(null);
            setIsAuthenticated(false);
            localStorage.removeItem("user");
          }
        }
      }
      throw error;
    }
  };

  // Delete a post
  const deletePost = async (postId) => {
    try {
      console.log("Deleting post:", postId);
      
      await apiService.delete(`/posts/${postId}`);
      
      console.log(`Post ${postId} deleted successfully`);
      
      // Remove the deleted post from state
      setPosts(prevPosts => prevPosts.filter(post => post.PostID !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      console.error("Response data:", error.response?.data);
      
      if (error.response && error.response.status === 401) {
        setAuthError("Please log in to delete posts");
      }
      throw error;
    }
  };

  // Like a post
  const likePost = async (postId) => {
    try {
      console.log("Liking post:", postId);
      
      const response = await apiService.post(`/posts/${postId}/like`);
      
      console.log(`Post ${postId} liked successfully, new likes: ${response.data.likes}`);
      
      // Update the post likes in state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.PostID === postId 
            ? { ...post, Likes: response.data.likes } 
            : post
        )
      );
      
      return response.data;
    } catch (error) {
      console.error("Error liking post:", error);
      console.error("Response data:", error.response?.data);
      
      if (error.response && error.response.status === 401) {
        setAuthError("Please log in to like posts");
      }
      throw error;
    }
  };

  // Test authentication status - useful for debugging
  const testAuth = async () => {
    try {
      console.log("Testing authentication status...");
      const response = await apiService.get("/auth/me");
      console.log("Auth test result:", response.data);
      return response.data;
    } catch (error) {
      console.error("Auth test failed:", error);
      throw error;
    }
  };

  // Other methods remain the same but use apiService instead of direct axios calls
  const fetchStudents = async () => {
    try {
      const response = await apiService.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      if (error.response && error.response.status === 401) {
        setAuthError("Please log in to view students");
      }
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await apiService.get("/tutors");
      setTutors(response.data);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      if (error.response && error.response.status === 401) {
        setAuthError("Please log in to view tutors");
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiService.get("/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response && error.response.status === 401) {
        setAuthError("Please log in to view notifications");
      }
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await apiService.get("/documents");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      if (error.response && error.response.status === 401) {
        setAuthError("Please log in to view documents");
      }
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        user,
        isAuthenticated,
        userRole,
        students,
        tutors,
        notifications,
        documents,
        posts,
        isLoadingPosts,
        authError,
        login,
        logout,
        hasRole,
        fetchStudents,
        fetchTutors,
        fetchNotifications,
        fetchDocuments,
        fetchPosts,
        createPost,
        deletePost,
        likePost,
        testAuth
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
