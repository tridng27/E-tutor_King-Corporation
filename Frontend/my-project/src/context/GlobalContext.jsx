import { createContext, useContext } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { PostProvider, usePost } from "./PostContext";
import { ResourceProvider, useResource } from "./ResourceContext";
import { DataProvider, useData } from "./DataContext";
import { MessageProvider, useMessage } from "./MessageContext"; // Add this line

// Create a combined context
export const GlobalContext = createContext(null);

// Combined provider component
export const GlobalProvider = ({ children }) => {
  return (
    <AuthProvider>
      <PostProvider>
        <ResourceProvider>
          <DataProvider>
            <MessageProvider> {/* Add this line */}
              <CombinedProvider>{children}</CombinedProvider>
            </MessageProvider> {/* Add this line */}
          </DataProvider>
        </ResourceProvider>
      </PostProvider>
    </AuthProvider>
  );
};

// Component that combines all context values
const CombinedProvider = ({ children }) => {
  // Get values from all contexts
  const authContext = useAuth();
  const postContext = usePost();
  const resourceContext = useResource();
  const dataContext = useData();
  const messageContext = useMessage(); // Add this line

  // Combine all context values
  const combinedValue = {
    // Auth context values
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    userRole: authContext.userRole,
    authError: authContext.authError,
    login: authContext.login,
    logout: authContext.logout,
    hasRole: authContext.hasRole,
    getTutorId: authContext.getTutorId,
    testAuth: authContext.testAuth,
    setAuthError: authContext.setAuthError,
   
    // Post context values
    posts: postContext.posts,
    isLoadingPosts: postContext.isLoadingPosts,
    fetchPosts: postContext.fetchPosts,
    createPost: postContext.createPost,
    editPost: postContext.editPost,
    deletePost: postContext.deletePost,
    likePost: postContext.likePost,
    commentOnPost: postContext.commentOnPost,
    editComment: postContext.editComment,
    deleteComment: postContext.deleteComment,
   
    // Resource context values
    fetchResources: resourceContext.fetchResources,
    getResourceById: resourceContext.getResourceById,
    createResource: resourceContext.createResource,
    updateResource: resourceContext.updateResource,
    deleteResource: resourceContext.deleteResource,
    downloadResource: resourceContext.downloadResource,
   
    // Data context values
    students: dataContext.students,
    tutors: dataContext.tutors,
    notifications: dataContext.notifications,
    documents: dataContext.documents,
    fetchStudents: dataContext.fetchStudents,
    fetchTutors: dataContext.fetchTutors,
    fetchNotifications: dataContext.fetchNotifications,
    fetchDocuments: dataContext.fetchDocuments,
    
    // Message context values
    conversations: messageContext.conversations,
    currentConversation: messageContext.currentConversation,
    messages: messageContext.messages,
    messageLoading: messageContext.loading,
    messageError: messageContext.error,
    unreadCount: messageContext.unreadCount,
    fetchConversations: messageContext.fetchConversations,
    fetchMessages: messageContext.fetchMessages,
    sendMessage: messageContext.sendMessage,
    searchUsers: messageContext.searchUsers,
    selectConversation: messageContext.selectConversation,
    setCurrentConversation: messageContext.setCurrentConversation,
    setMessageError: messageContext.setError
  };

  return (
    <GlobalContext.Provider value={combinedValue}>
      {children}
    </GlobalContext.Provider>
  );
};

// Export a custom hook to use the global context
export const useGlobal = () => useContext(GlobalContext);
