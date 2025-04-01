import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';
import Sidebar from '../../components/sidebar';
import RightSidebar from '../../components/rightSidebar';

function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/subjects');
      setSubjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
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

  return (
    <div className="relative">
      <div className="flex h-screen">
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 p-6 ml-16 transition-all duration-300 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h1 className="text-2xl font-bold mb-4">Subject Management</h1>
            
            {/* Create new subject form */}
            <form onSubmit={handleCreateSubject} className="mb-6">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter new subject name"
                  className="flex-1 p-2 border rounded"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading || !newSubject.trim()}
                >
                  Add Subject
                </button>
              </div>
            </form>

            {/* Search bar */}
            <input
              type="text"
              placeholder="Search subjects..."
              className="w-full p-2 border rounded mb-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Subjects list */}
            {loading && subjects.length === 0 ? (
              <p className="text-center py-4">Loading subjects...</p>
            ) : filteredSubjects.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                {searchTerm ? `No subjects found matching "${searchTerm}"` : 'No subjects available'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-2">ID</th>
                      <th className="p-2">Subject Name</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.map(subject => (
                      <tr key={subject.SubjectID} className="border-b hover:bg-gray-50">
                        <td className="p-2">{subject.SubjectID}</td>
                        <td className="p-2">
                          {editingSubject?.SubjectID === subject.SubjectID ? (
                            <input
                              type="text"
                              className="w-full p-1 border rounded"
                              value={editingSubject.SubjectName}
                              onChange={(e) => setEditingSubject({
                                ...editingSubject,
                                SubjectName: e.target.value
                              })}
                            />
                          ) : (
                            subject.SubjectName
                          )}
                        </td>
                        <td className="p-2">
                          {editingSubject?.SubjectID === subject.SubjectID ? (
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateSubject}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                disabled={loading}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSubject(null)}
                                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingSubject(subject)}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                disabled={loading}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(subject.SubjectID)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}

export default SubjectManagement;
