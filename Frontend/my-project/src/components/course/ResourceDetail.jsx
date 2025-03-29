import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../context/GlobalContext';
import Sidebar from '../sidebar';
import RightSidebar from '../rightSidebar';

function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { 
    user,
    userRole, 
    hasRole, 
    getResourceById, 
    deleteResource, 
    downloadResource,
    authError 
  } = useContext(GlobalContext);
  
  useEffect(() => {
    const loadResource = async () => {
      try {
        setLoading(true);
        const data = await getResourceById(id);
        setResource(data);
      } catch (error) {
        console.error("Error loading resource:", error);
        setError(error.response?.data?.message || 'Failed to load resource');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadResource();
    }
  }, [id, getResourceById]);

  const handleEdit = () => {
    navigate(`/resource/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        navigate('/course');
      } catch (error) {
        console.error("Error deleting resource:", error);
        setError(error.response?.data?.message || 'Failed to delete resource');
      }
    }
  };

  const handleDownload = async () => {
    try {
      await downloadResource(id, resource?.title);
    } catch (error) {
      console.error("Error downloading resource:", error);
      setError(error.response?.data?.message || 'Failed to download resource');
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 p-6 ml-16 transition-all duration-300 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <RightSidebar />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 p-6 ml-16 transition-all duration-300">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {authError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {authError}
            </div>
          )}
          
          <div className="max-w-2xl mx-auto p-4 space-y-2">
            {/* Description */}
            <h2 className="font-semibold text-lg">Description: </h2>
            <div className="border p-4 rounded-lg">
              <p className="w-full p-2">{resource?.description || 'No description available'}</p>
            </div>

            {/* Requirement Input */}
            <h5 className="font-semibold">Uploaded by:</h5>
            <div className="border p-4 rounded-lg">
              <p className="w-full p-2">{resource?.tutorId === null ? "Admin (System)" : resource?.tutorName}</p>
            </div>
            
            {/* Date Input */}
            <h5 className="font-semibold">Date:</h5>
            <div className="flex gap-4 items-center">
              <p className="border p-2 rounded-lg w-1/3">
                {resource?.uploadDate ? new Date(resource.uploadDate).toLocaleDateString() : 'Unknown'}
              </p>
              
              {/* Download Button */}
              {resource?.filePath && (
                <button 
                  onClick={handleDownload}
                  className="border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
                >
                  Download course file <span className="text-xl">⬇️</span>
                </button>
              )}
            </div>
            
            {/* Placeholder Image or PDF Preview */}
            <div className="bg-gray-300 p-8 rounded-lg flex justify-center items-center">
              <div className="text-gray-500">
                {resource?.filePath ? 'PDF Document Available' : 'No Document Available'}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              {/* Removed the Download PDF button from here */}
              
              {/* Edit and Delete buttons for Admin or the Tutor who created the resource */}
              {(hasRole('Admin') || (hasRole('Tutor') && resource?.tutorId === user?.TutorID)) && (
                <>
                  <button 
                    onClick={handleEdit}
                    className="border px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="border px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
              
              <button 
                onClick={() => navigate('/course')}
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Back to Resources
              </button>
            </div>
          </div>
        </div>

        <RightSidebar />
      </div>
    </div>
  );
}

export default ResourceDetail;
