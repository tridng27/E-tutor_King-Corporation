import React from 'react';

function AdminSidebar() {

  return (
    <div className="w-1/5 bg-gray-100 p-6 " >
            {/* Course Categories */}
            <h2 className="text-lg font-semibold mb-2">Courses Categories</h2>
            <ul className="space-y-2">
                <li className="px-4 py-2 hover:bg-gray-200 rounded-lg">Security</li>
                <li className="px-4 py-2 hover:bg-gray-200 rounded-lg">IoT</li>
                <li className="px-4 py-2 hover:bg-gray-200 rounded-lg">Game Development</li>
                <li className="px-4 py-2 hover:bg-gray-200 rounded-lg">Networking</li>
            </ul>
            
            {/* Divider */}
            <hr className="my-4 border-gray-300" />
            
            {/* Top Courses */}
            <h2 className="text-lg font-semibold mb-2">Top Courses</h2>
            <ul className="space-y-2">
                <li className="flex items-center gap-2">
                <span className="text-md">📁</span> COMPTiA Security+
                </li>
                <li className="flex items-center gap-2">
                <span className="text-md">📁</span> COMPTiA A+
                </li>
                <li className="flex items-center gap-2">
                <span className="text-md">📁</span> Unity Dev Starter Pack
                </li>
            </ul>
            
            {/* Add Button */}
            <div className="mt-6 flex justify-center">
                <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-2xl shadow-lg">
                +
                </button>
            </div>
    </div>
  );
}

export default AdminSidebar;
