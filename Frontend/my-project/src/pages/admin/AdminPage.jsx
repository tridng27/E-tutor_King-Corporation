import React from 'react';
import { useGlobal } from '../../context/GlobalContext';
import UserManagement from '../../components/admin/UserManagement';
import Sidebar from '../../components/sidebar';

const AdminPage = () => {
  // Add a fallback for user to prevent the destructuring error
  const globalContext = useGlobal();
  const user = globalContext?.user || { Name: 'Admin' };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Add the Sidebar component */}
      <Sidebar />
      
      {/* Main content with padding to account for sidebar */}
      <div className="flex-1 ml-16">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome, {user.Name}</p>
            </div>
            
            <div className="p-6">
              <UserManagement />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
