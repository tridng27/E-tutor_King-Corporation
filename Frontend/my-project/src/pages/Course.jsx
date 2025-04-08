import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import { GlobalContext } from '../context/GlobalContext';
import { BadgeCheck } from 'lucide-react';
import RightSidebar from '../components/rightSidebar';


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
    <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 overflow-y-auto transition-all duration-300 ml-10 md:ml-16 pl-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            
            {hasRole(['Admin', 'Tutor']) && (
              <button 
                onClick={() => navigate('/resource/add')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold mt-1 ml-6 py-2 px-4 md:py-3 md:px-6 text-sm md:text-base rounded"
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


          <div className=" flex flex-col items-center p-8">
            <h1 className="text-4xl font-bold mb-4">Study Materials</h1>
            <p className="text-gray-400 mb-6 text-center max-w-xl">
              Start a conversation and find learning to match your goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <button className=" px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-400 transition">
                ✨ I'm new to coding, what courses should I take?
              </button>
              <button className=" px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-400 transition">
                ✨ What can I learn for my career?
              </button>
              <button className=" px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-400 transition">
                ✨ What projects can help me showcase my skills?
              </button>
              <button className=" px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-400 transition">
                ✨ How can I earn certificates?
              </button>
            </div>
            
            <div className="relative w-full max-w-lg">
              <input
                type="text" 
                placeholder="Search..." 
                className="w-full px-4 py-3 rounded-lg text-gray-700 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                ➤
              </button>

            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
  {filteredResources.map(resource => (
    <div
      key={resource.id}
      className="w-full rounded-lg border border-black hover:-translate-y-1 hover:translate-x-1 hover:border-l-4 hover:border-b-4 transition-all duration-300 shadow-md min-h-[260px]"
    >
      <div className="bg-[#EAFDC6] rounded-t-md">
        <h4 className="text-xl font-bold mb-2 p-2">
          {resource.title
            ? (resource.title.length > 25
                ? `${resource.title.substring(0, 25)}...`
                : resource.title)
            : 'Untitled'}
        </h4>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm h-[110px] overflow-hidden text-ellipsis">
          {resource.description
            ? (resource.description.length > 150
                ? `${resource.description.substring(0, 150)}...`
                : resource.description)
            : 'No description available'}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {new Date(resource.uploadDate).toLocaleDateString()}
          </span>
          <button
            className="bg-green-100 text-green-600 px-3 py-1 rounded-md w-fit"
            onClick={() => navigate(`/resource/${resource.id}`)}
          >
            View Details
          </button>
        </div>
        <div className="border-t border-b border-dotted border-black mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 p-1">
          <BadgeCheck size={18} strokeWidth={1.25} className="shrink-0" />
          <p className="text-sm">
            With <span className="font-semibold">Certificate</span>
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

          )}
        </div>

        <div className="hidden md:block">
          <RightSidebar />
        </div>
    </div>
  );
}

export default Course;
