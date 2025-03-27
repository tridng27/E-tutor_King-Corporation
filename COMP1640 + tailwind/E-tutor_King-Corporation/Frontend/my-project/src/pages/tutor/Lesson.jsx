import React from 'react';
import Sidebar from '../../components/sidebar';
import AdminSidebar from '../../components/admin/adminSidebar';

function Lesson() {
  return (
    <div className="relative">
            <div className="flex h-screen">
                <Sidebar />

                {/* Nội dung chính */}
                <div className="flex-1 p-6 ml-16 transition-all duration-300">
                    <div className="max-w-2xl mx-auto p-6 space-y-6">
                        <h1 className="text-2xl font-bold text-center">Lesson Adding</h1>
                        <hr className="border-gray-300" />

                        {/* Description */}
                        <div>
                            <label className="block font-semibold">Description:</label>
                            <input 
                            type="text" 
                            placeholder="Input something..." 
                            className="w-full border p-3 rounded-lg bg-gray-100"
                            />
                        </div>

                        {/* Name Lesson */}
                        <div>
                            <label className="block font-semibold">Name Leson:</label>
                            <input 
                            type="text" 
                            placeholder="Input something..." 
                            className="w-full border p-3 rounded-lg bg-gray-100"
                            />
                        </div>
                        
                        {/* Requirement */}
                        <div>
                            <label className="block font-semibold">Requirement:</label>
                            <input 
                            type="text" 
                            placeholder="Input something..." 
                            className="w-full border p-3 rounded-lg bg-gray-100"
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block font-semibold">Date:</label>
                            <input 
                            type="text" 
                            placeholder="Input something..." 
                            className="w-full border p-3 rounded-lg bg-gray-100"
                            />
                        </div>

                        {/* File Upload */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border p-6 rounded-lg bg-gray-100 text-center cursor-pointer" onClick={() => document.getElementById('fileInput').click()}>
                                <label className="block font-semibold">File:</label>
                                <input type="file" id="fileInput" className="hidden" />
                                <p className="text-gray-500">Click to upload file</p>
                                </div>

                                {/* Video Upload */}
                                <div className="border p-6 rounded-lg bg-gray-100 text-center cursor-pointer" onClick={() => document.getElementById('videoInput').click()}>
                                <label className="block font-semibold">Video:</label>
                                <input type="file" id="videoInput" className="hidden" />
                                <p className="text-gray-500">Click to upload video</p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between">
                            <button className="border px-6 py-2 rounded-lg">cancel</button>
                            <button className="bg-black text-white px-6 py-2 rounded-lg">Confirm</button>
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <AdminSidebar />
            </div>
    </div>
  );
}

export default Lesson;