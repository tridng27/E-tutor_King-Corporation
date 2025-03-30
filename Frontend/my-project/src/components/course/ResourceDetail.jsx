import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../context/GlobalContext';
import Sidebar from '../sidebar';
import RightSidebar from '../rightSidebar';
import { BadgeCheck, BookCheck, FileCheck, Bot, CircleCheckBig } from 'lucide-react';

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
          
          <div className="mx-auto p-4 space-y-2">
            <div className="p-8 flex flex-col md:flex-row items-start justify-between rounded-lg">
              <div className="max-w-lg">
                <p className="uppercase text-sm font-semibold tracking-wide text-gray-700">Course</p>
                <h1 className="text-4xl font-bold text-gray-900 mt-2">Learn Explainable AI</h1>
                <p className="text-gray-700 mt-4">Uploaded by: {resource?.tutorId === null ? "Admin (System)" : resource?.tutorName}</p>
                <p className="text-gray-700 text-sm">{resource?.uploadDate ? new Date(resource.uploadDate).toLocaleDateString() : 'Unknown'}</p>
                <button className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition">
                  Start
                </button>
              </div>

              <div className="border border-gray-500 p-6 mt-8 md:mt-0 md:ml-12 rounded-lg relative">
                <h3 className="text-lg font-bold mb-4">This course includes</h3>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-2 border-b pb-2">
                    <Bot />
                    <p>AI assistance for guided coding help</p>
                  </li>
                  <li className="flex items-center space-x-2 border-b pb-2">
                    <FileCheck />
                    <p>Projects to apply new skills</p>
                  </li>
                  <li className="flex items-center space-x-2 border-b pb-2">
                    <BookCheck />
                    <p>Quizzes to test your knowledge</p>
                  </li>
                  <li className="flex items-center space-x-2">
                    <BadgeCheck />
                    <p>A <span className="font-bold">certificate</span> of completion</p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Description */}
            <div className="flex">
              <div className="basis-2/3">
                <h2 className="font-semibold text-2xl">About this course</h2>
                <p className="pr-20">{resource?.description || 'No description available'}</p>
              </div>
              <div className="basis-1/3">
                <h2 className="font-semibold text-2xl mb-2">Your Skills your gain</h2>
                <ul>
                  <li className="flex items-center gap-x-2 space-x-2 pb-2">
                    <CircleCheckBig size={20} />
                    <p>Problem-Solving Skills</p>
                  </li>
                  <li className="flex items-center gap-x-2 space-x-2 pb-2">
                    <CircleCheckBig size={20} />
                    <p>Project-Based Learning </p>
                  </li>
                  <li className="flex items-center gap-x-2 space-x-2 pb-2">
                    <CircleCheckBig size={20} />
                    <p>Hands-on Experience</p>
                  </li>
                  <li className="flex items-center gap-x-2 space-x-2 pb-2">
                   <CircleCheckBig size={20} />
                    <p>System Design & Architecture</p>
                  </li>
                  <li className="flex items-center gap-x-2 space-x-2 pb-2">
                   <CircleCheckBig size={20} />
                    <p>Version Control (Git & GitHub)</p>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-4 items-center">      
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
