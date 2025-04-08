import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../context/GlobalContext';
import Sidebar from '../../components/sidebar';
import AdminSidebar from '../../components/admin/adminSidebar';

function ResourceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pdfFile: null
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const { 
    userRole, 
    getResourceById, 
    createResource, 
    updateResource,
    authError 
  } = useContext(GlobalContext);
  
  useEffect(() => {
    if (isEditMode) {
      const loadResource = async () => {
        try {
          setLoading(true);
          const data = await getResourceById(id);
          setFormData({
            title: data.title || '', 
            description: data.description || '', 
            pdfFile: null
          });
        } catch (error) {
          console.error("Error loading resource:", error);
          setError(error.response?.data?.message || 'Failed to load resource');
        } finally {
          setLoading(false);
        }
      };
      
      loadResource();
    }
  }, [id, isEditMode, getResourceById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      pdfFile: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode) {
        await updateResource(id, formData);
        setSuccess('Resource updated successfully!');
        setTimeout(() => navigate(`/resource/${id}`), 1500);
      } else {
        const result = await createResource(formData);
        setSuccess('Resource created successfully!');
        
        // Use a safer approach to reset the form
        setFormData({
          title: '',
          description: '',
          pdfFile: null
        });
        
        // Only try to reset the file input if it exists
        const fileInput = document.getElementById('pdfFile');
        if (fileInput) {
          fileInput.value = '';
        }
        
        // Navigate after a short delay
        setTimeout(() => {
          if (result && result.resource && result.resource.id) {
            navigate(`/resource/${result.resource.id}`);
          } else {
            // If we don't have a valid ID, just go back to the resources list
            navigate('/course');
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Don't show error message if resource was created successfully
      if (!success) {
        setError(error.response?.data?.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 p-6 ml-16 transition-all duration-300 overflow-y-auto">
          <div className="mb-4">
            <button 
              onClick={() => navigate('/course')}
              className="text-blue-500 hover:underline flex items-center"
            >
               ← Back to Study Materials
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">
              {isEditMode ? 'Edit Study Material' : 'Add New Study Material'}
            </h1>
            
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
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="6"
                  required
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pdfFile">
                  PDF File
                </label>
                <input
                  type="file"
                  id="pdfFile"
                  name="pdfFile"
                  onChange={handleFileChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  accept=".pdf"
                  {...(!isEditMode && { required: true })}
                />
                {isEditMode && (
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to keep the current PDF file. Upload a new one to replace it.
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (isEditMode ? 'Update Material' : 'Create Material')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/course')}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {userRole === 'Admin' && <AdminSidebar />}
      </div>
    </div>
  );
}

export default ResourceForm;
