import { createContext, useState, useContext } from "react";
import apiService from "../services/apiService";
import { AuthContext } from './AuthContext';

export const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const { setAuthError } = useContext(AuthContext);

  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const response = await apiService.get("/posts");
      setPosts(response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to view posts");
      }
      throw error;
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const createPost = async (postData) => {
    try {
      const response = await apiService.post("/posts", postData);
      setPosts(prevPosts => [response.data.post, ...prevPosts]);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to create posts");
      }
      throw error;
    }
  };

  const editPost = async (postId, postData) => {
    try {
      const response = await apiService.put(`/posts/${postId}`, postData);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.PostID === postId
            ? (response.data.post || response.data)
            : post
        )
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to edit posts");
      } else if (error.response?.status === 403) {
        setAuthError("You can only edit your own posts");
      }
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      await apiService.delete(`/posts/${postId}`);
      setPosts(prevPosts => prevPosts.filter(post => post.PostID !== postId));
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to delete posts");
      } else if (error.response?.status === 403) {
        setAuthError("You can only delete your own posts");
      }
      throw error;
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await apiService.post(`/posts/${postId}/like`);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.PostID === postId
            ? { ...post, Likes: response.data.likes }
            : post
        )
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to like posts");
      }
      throw error;
    }
  };

  const commentOnPost = async (postId, commentText) => {
    try {
      const response = await apiService.post(`/posts/${postId}/comments`, {
        content: commentText
      });
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.PostID === postId
            ? {
                ...post,
                Comments: [...(post.Comments || []), response.data]
              }
            : post
        )
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to comment on posts");
      }
      throw error;
    }
  };

  const editComment = async (postId, commentId, content) => {
    try {
      const response = await apiService.put(`/posts/${postId}/comments/${commentId}`, {
        content
      });
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.PostID === parseInt(postId)) {
            return {
              ...post,
              Comments: post.Comments?.map(comment =>
                comment.CommentID === parseInt(commentId)
                  ? (response.data.comment || response.data)
                  : comment
              ) || []
            };
          }
          return post;
        })
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to edit comments");
      } else if (error.response?.status === 403) {
        setAuthError("You can only edit your own comments");
      }
      throw error;
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await apiService.delete(`/posts/${postId}/comments/${commentId}`);
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.PostID === parseInt(postId)) {
            return {
              ...post,
              Comments: post.Comments?.filter(comment =>
                comment.CommentID !== parseInt(commentId)
              ) || []
            };
          }
          return post;
        })
      );
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to delete comments");
      } else if (error.response?.status === 403) {
        setAuthError("You can only delete your own comments");
      }
      throw error;
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        isLoadingPosts,
        fetchPosts,
        createPost,
        editPost,
        deletePost,
        likePost,
        commentOnPost,
        editComment,
        deleteComment
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

// Custom hook to use the post context
export const usePost = () => useContext(PostContext);
