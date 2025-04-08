import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = users.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [allUsers, pendingUsers] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getPendingUsers()
      ]);
      setUsers(allUsers);
      setPendingUsers(pendingUsers);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch users: ' + error.message);
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId, requestedRole) => {
    try {
      await apiService.assignUserRole(userId, requestedRole || 'Student');
      setSuccessMessage(`User approved successfully as ${requestedRole || 'Student'}`);
      fetchUsers(); 
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
      
    } catch (error) {
      setError('Failed to approve user: ' + error.message);
      setTimeout(() => {
        setError('');
      }, 2000);
    }
  };
  

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await apiService.deleteUser(userId);
        setSuccessMessage('User deleted successfully');
        fetchUsers();
      } catch (error) {
        setError('Failed to delete user: ' + error.message);
      }
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await apiService.assignUserRole(userId, newRole);
      setSuccessMessage(`User role changed successfully to ${newRole}`);
      fetchUsers(); // Refresh user lists
    } catch (error) {
      setError('Failed to change role: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{successMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccessMessage('')}>
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Pending Users</h2>
        {pendingUsers.length === 0 ? (
          <p className="text-gray-500">No pending users to approve</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Requested Role</th>
                  <th className="px-4 py-2 border">Register Date</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user.UserID}>
                    <td className="px-4 py-2 border">{user.UserID}</td>
                    <td className="px-4 py-2 border">{user.Name}</td>
                    <td className="px-4 py-2 border">{user.Email}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.RequestedRole === 'Tutor' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.RequestedRole || 'Student'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">{new Date(user.RegisterDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex space-x-2">
                        <button 
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                          onClick={() => handleApproveUser(user.UserID, user.RequestedRole || 'Student')}
                        >
                          Approve as {user.RequestedRole || 'Student'}
                        </button>
                        <button 
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                          onClick={() => handleDeleteUser(user.UserID)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">All Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-left">
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Register Date</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user.UserID} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-2 border">{user.UserID}</td>
                  <td className="px-4 py-2 border">{user.Name}</td>
                  <td className="px-4 py-2 border">{user.Email}</td>
                  <td className="px-4 py-2 border">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.Role === 'Admin' ? 'bg-red-100 text-red-800' : 
                      user.Role === 'Tutor' ? 'bg-blue-100 text-blue-800' : 
                      user.Role === 'Student' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.Role || 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">{new Date(user.RegisterDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">
                    <div className="flex space-x-2">
                      {user.Role !== 'Admin' && (
                        <>
                          <button 
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleChangeRole(user.UserID, 'Student')}
                            disabled={user.Role === 'Student'}
                          >
                            Set as Student
                          </button>
                          <button 
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleChangeRole(user.UserID, 'Tutor')}
                            disabled={user.Role === 'Tutor'}
                          >
                            Set as Tutor
                          </button>
                        </>
                      )}
                      <button 
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                        onClick={() => handleDeleteUser(user.UserID)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4 px-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <div className="space-x-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
