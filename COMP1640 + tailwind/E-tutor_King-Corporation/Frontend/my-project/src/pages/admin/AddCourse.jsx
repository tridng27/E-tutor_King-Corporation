import React from 'react';
import Sidebar from '../../components/sidebar';
import AdminSidebar from '../../components/admin/adminSidebar';

function AddCourse() {
  return (
    <div className="relative">
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 p-6 ml-16 transition-all duration-300">
            <div className="max-w-2xl mx-auto p-4 space-y-2">
                {/* Description */}
                <h2 className="font-semibold text-lg">Description: </h2>
                <div className="border p-4 rounded-lg">
                    <input 
                        type="text" 
                        placeholder="" 
                        className="w-full p-2" 
                    />
                </div>

                {/* Requirement Input */}
                <h5 className="font-semibold">Requirement:</h5>
                <div className="border p-4 rounded-lg">
                    <input 
                        type="text" 
                        placeholder="" 
                        className="w-full p-2" 
                    />
                </div>
                
                {/* Date Input */}
                <h5 className="font-semibold">Date:</h5>
                <div className="flex gap-4 items-center">
                    <input 
                    type="text" 
                    placeholder="" 
                    className="border p-2 rounded-lg w-1/3" 
                    />
                    
                    {/* Download Button */}
                    <button className="border px-4 py-2 rounded-lg flex items-center gap-2">
                    Dowload course file <span className="text-xl">⬇️</span>
                    </button>
                </div>
                
                {/* Placeholder Image */}
                <div className="bg-gray-300 p-8 rounded-lg flex justify-center items-center">
                    <div className="text-gray-500">[Image Placeholder]</div>
                </div>
                
                {/* Get Video Button */}
                <div className="flex justify-center">
                    <button className="border px-4 py-2 rounded-lg">get video</button>
                </div>
            </div>
        </div>

        <AdminSidebar/>
      </div>
    </div>
  );
}
export default AddCourse;