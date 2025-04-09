import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';
import Sidebar from '../../components/sidebar';
import RightSidebar from '../../components/rightSidebar';
import { Plus, Search, Edit2, Trash2, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/subjects');
      setSubjects(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
      setError('Failed to load subjects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) {
      toast.error('Subject name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await apiService.post('/subjects', { SubjectName: newSubject });
      setNewSubject('');
      fetchSubjects();
      toast.success('Subject created successfully');
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error(error.response?.data?.message || 'Failed to create subject');
      setLoading(false);
    }
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    if (!editingSubject.SubjectName.trim()) {
      toast.error('Subject name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await apiService.put(`/subjects/${editingSubject.SubjectID}`, { 
        SubjectName: editingSubject.SubjectName 
      });
      setEditingSubject(null);
      fetchSubjects();
      toast.success('Subject updated successfully');
    } catch (error) {
      console.error('Error updating subject:', error);
      toast.error(error.response?.data?.message || 'Failed to update subject');
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.delete(`/subjects/${subjectId}`);
      fetchSubjects();
      toast.success('Subject deleted successfully');
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error(error.response?.data?.message || 'Failed to delete subject');
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.SubjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSubjects = filteredSubjects.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 ml-16 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Subject Management</h1>
            <Link 
              to="/admin/student" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 bg-opacity-20 text-blue-700 border border-blue-600 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Student Management</span>
            </Link>
          </div>

          {/* Create new subject form */}
          <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Subject</h2>
            <form onSubmit={handleCreateSubject} className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Enter new subject name"
                  className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Plus size={18} className="text-gray-400" />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 bg-opacity-20 text-green-700 border border-green-600 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50 w-full md:w-auto"
                disabled={loading || !newSubject.trim()}
              >
                Add Subject
              </button>
            </form>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-4 border rounded-lg p-2 shadow-sm bg-white">
            <Search className="text-gray-500" />
            <input
              type="text"
              placeholder="Search subjects..."
              className="flex-1 p-2 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Subjects List */}
          {loading && subjects.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <p className="text-gray-500">
                {searchTerm ? `No subjects found matching "${searchTerm}"` : 'No subjects available'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-white text-left">
                      <th className="p-3 w-20">ID</th>
                      <th className="p-3">Subject Name</th>
                      <th className="p-3 w-48 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubjects.map(subject => (
                      <tr key={subject.SubjectID} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-600">{subject.SubjectID}</td>
                        <td className="p-3">
                          {editingSubject?.SubjectID === subject.SubjectID ? (
                            <input
                              type="text"
                              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              value={editingSubject.SubjectName}
                              onChange={(e) => setEditingSubject({
                                ...editingSubject,
                                SubjectName: e.target.value
                              })}
                            />
                          ) : (
                            <span className="font-medium">{subject.SubjectName}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingSubject?.SubjectID === subject.SubjectID ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={handleUpdateSubject}
                                className="px-4 py-2 bg-green-600 bg-opacity-20 text-green-700 border border-green-600 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-1"
                                disabled={loading}
                              >
                                <Save size={16} />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => setEditingSubject(null)}
                                className="px-4 py-2 bg-red-500 bg-opacity-20 text-red-700 border border-red-500 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-1"
                                disabled={loading}
                              >
                                <X size={16} />
                                <span>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => setEditingSubject(subject)}
                                className="px-4 py-2 bg-blue-600 bg-opacity-20 text-blue-700 border border-blue-600 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-1"
                                disabled={loading}
                              >
                                <Edit2 size={16} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(subject.SubjectID)}
                                className="px-4 py-2 bg-red-500 bg-opacity-20 text-red-700 border border-red-500 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-1"
                                disabled={loading}
                              >
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {currentSubjects.map(subject => (
                  <div key={subject.SubjectID} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs text-gray-500">ID: {subject.SubjectID}</span>
                        {editingSubject?.SubjectID === subject.SubjectID ? (
                          <input
                            type="text"
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={editingSubject.SubjectName}
                            onChange={(e) => setEditingSubject({
                              ...editingSubject,
                              SubjectName: e.target.value
                            })}
                          />
                        ) : (
                          <h3 className="font-semibold text-lg">{subject.SubjectName}</h3>
                        )}
                      </div>
                    </div>
                    
                    {editingSubject?.SubjectID === subject.SubjectID ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateSubject}
                          className="flex-1 py-2 bg-green-600 bg-opacity-20 text-green-700 border border-green-600 rounded-lg hover:bg-opacity-30 transition-colors flex items-center justify-center gap-1"
                          disabled={loading}
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </button>
                        <button
                                                    onClick={() => setEditingSubject(null)}
                                                    className="flex-1 py-2 bg-red-500 bg-opacity-20 text-red-700 border border-red-500 rounded-lg hover:bg-opacity-30 transition-colors flex items-center justify-center gap-1"
                                                    disabled={loading}
                                                  >
                                                    <X size={16} />
                                                    <span>Cancel</span>
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className="flex gap-2">
                                                  <button
                                                    onClick={() => setEditingSubject(subject)}
                                                    className="flex-1 py-2 bg-blue-600 bg-opacity-20 text-blue-700 border border-blue-600 rounded-lg hover:bg-opacity-30 transition-colors flex items-center justify-center gap-1"
                                                    disabled={loading}
                                                  >
                                                    <Edit2 size={16} />
                                                    <span>Edit</span>
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteSubject(subject.SubjectID)}
                                                    className="flex-1 py-2 bg-red-500 bg-opacity-20 text-red-700 border border-red-500 rounded-lg hover:bg-opacity-30 transition-colors flex items-center justify-center gap-1"
                                                    disabled={loading}
                                                  >
                                                    <Trash2 size={16} />
                                                    <span>Delete</span>
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                          
                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                          <div className="flex justify-between items-center mt-4 px-2 bg-white rounded-lg shadow-sm p-3">
                                            <span className="text-sm text-gray-600">
                                              Page {currentPage} of {totalPages}
                                            </span>
                                            <div className="space-x-2">
                                              <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 bg-gray-200 bg-opacity-50 border border-gray-300 rounded disabled:opacity-50 flex items-center"
                                              >
                                                <ChevronLeft size={16} className="mr-1" />
                                                <span className="hidden sm:inline">Previous</span>
                                              </button>
                                              <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 bg-gray-200 bg-opacity-50 border border-gray-300 rounded disabled:opacity-50 flex items-center"
                                              >
                                                <span className="hidden sm:inline">Next</span>
                                                <ChevronRight size={16} className="ml-1" />
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                          
                                {/* Right sidebar */}
                                <RightSidebar />
                              </div>
                            );
                          }
                          
                          export default SubjectManagement;
                          
