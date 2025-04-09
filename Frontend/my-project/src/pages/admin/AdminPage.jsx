import React from 'react';
import { useGlobal } from '../../context/GlobalContext';
import UserManagement from '../../components/admin/UserManagement';
import Sidebar from '../../components/sidebar';
import RightSidebar from '../../components/rightSidebar';

const AdminPage = () => {
  const globalContext = useGlobal();
  const user = globalContext?.user || { Name: 'Admin' };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 ml-16 flex flex-col overflow-hidden">
        <div className="p-4 md:p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Admin Management</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome, {user.Name}</p>
          </div>
          
          <div className="w-full">
            <UserManagement />
          </div>
        </div>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default AdminPage;
