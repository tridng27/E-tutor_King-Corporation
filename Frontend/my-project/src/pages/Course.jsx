import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import AdminSidebar from '../components/admin/adminSidebar';
import { GlobalContext } from '../context/GlobalContext';

function Course() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { fetchResources, hasRole, userRole, authError } = useContext(GlobalContext);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const data = await fetchResources();
        setResources(data);
      } catch (error) {
        console.error("Error loading resources:", error);
        setError(error.response?.data?.message || 'Failed to load resources');
      } finally {
        setLoading(false);
      }
    };
    
    loadResources();
  }, [fetchResources]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredResources = resources.filter(resource => {
    // Skip resources with missing required properties
    if (!resource) return false;
    
    // Use title and description properties instead of Name and Description
    const title = resource.title || '';
    const description = resource.description || '';
    
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="relative">
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 p-6 ml-16 transition-all duration-300 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Study Materials</h1>
            
            {hasRole(['Admin', 'Tutor']) && (
              <button 
                onClick={() => navigate('/resource/add')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add New Material
              </button>
            )}
          </div>

          {authError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {authError}
            </div>
          )}

          <div className="mb-6">
            <input 
              type="text" 
              placeholder="Search materials..." 
              className="w-full p-2 border rounded-lg"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No study materials found.</p>
              {searchTerm && (
                <p className="text-gray-500 mt-2">
                  Try adjusting your search or clear the search field.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResources.map(resource => (
                <div key={resource.id} className="bg-white p-4 rounded-lg border shadow-md flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">📚</span>
                    <h2 className="font-bold text-lg">{resource.title || 'Untitled'}</h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {resource.description 
                      ? (resource.description.length > 150 
                          ? `${resource.description.substring(0, 150)}...` 
                          : resource.description)
                      : 'No description available'}
                  </p>
                  <div className="flex justify-between items-center">
                    <button 
                      className="bg-green-100 text-green-600 px-3 py-1 rounded-md w-fit"
                      onClick={() => navigate(`/resource/${resource.id}`)}
                    >
                      View Details
                    </button>
                    <span className="text-xs text-gray-500">
                      {new Date(resource.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {userRole === 'Admin' && <AdminSidebar />}
      </div>
    </div>
  );
}

export default Course;
