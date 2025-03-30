import { createContext, useContext } from "react";
import apiService from "../services/apiService";
import { AuthContext } from './AuthContext';

export const ResourceContext = createContext(null);

export const ResourceProvider = ({ children }) => {
  const { setAuthError } = useContext(AuthContext);

  const fetchResources = async () => {
    try {
      const response = await apiService.get("/resources");
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to view resources");
      }
      throw error;
    }
  };

  const getResourceById = async (resourceId) => {
    try {
      const response = await apiService.get(`/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to view this resource");
      }
      throw error;
    }
  };

  const createResource = async (resourceData) => {
    try {
      const formData = new FormData();
      formData.append('title', resourceData.title);
      formData.append('description', resourceData.description);
      
      if (resourceData.pdfFile) {
        formData.append('pdfFile', resourceData.pdfFile);
      }
      
      const response = await apiService.post("/resources", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to create resources");
      } else if (error.response?.status === 403) {
        setAuthError("You don't have permission to create resources");
      }
      throw error;
    }
  };

  const updateResource = async (resourceId, resourceData) => {
    try {
      const formData = new FormData();
      formData.append('title', resourceData.title);
      formData.append('description', resourceData.description);
      
      if (resourceData.pdfFile) {
        formData.append('pdfFile', resourceData.pdfFile);
      }
      
      const response = await apiService.put(`/resources/${resourceId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to update resources");
      } else if (error.response?.status === 403) {
        setAuthError("You don't have permission to update this resource");
      }
      throw error;
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      await apiService.delete(`/resources/${resourceId}`);
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to delete resources");
      } else if (error.response?.status === 403) {
        setAuthError("You don't have permission to delete this resource");
      }
      throw error;
    }
  };

  const downloadResource = async (resourceId, resourceName) => {
    try {
      const response = await apiService.get(`/resources/${resourceId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resourceName || 'resource'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to download resources");
      } else if (error.response?.status === 404) {
        setAuthError("Resource file not found");
      }
      throw error;
    }
  };

  return (
    <ResourceContext.Provider
      value={{
        fetchResources,
        getResourceById,
        createResource,
        updateResource,
        deleteResource,
        downloadResource
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};

// Custom hook to use the resource context
export const useResource = () => useContext(ResourceContext);
