import React, { useState } from 'react';
import Sidebar from '../../components/sidebar';
import RightSidebar from '../../components/rightSidebar';
import { Search, Plus } from 'lucide-react';
import StudentInformation from '../../components/studentInformation'; 
import TutorInformation from '../../components/tutorInformation';

function Students() {
    const [showStudentInfo, setShowStudentInfo] = useState(false);
    const [showTutorInfo, setShowTutorInfo] = useState(false);

    return (
      <div className="relative">
        <div className="flex h-full ">
            <Sidebar/>
              
            <div className="flex-1 p-6 ml-16">
                {/* Search Bar */}
              <div className="flex items-center gap-2 mb-4 border rounded-lg p-2 shadow-sm">
                <input type="text" placeholder="Value" className="flex-1 p-2 outline-none" />
                <Search className="text-gray-500 cursor-pointer" />
                <Plus 
                  className="text-gray-500 cursor-pointer" 
                  onClick={() => setShowStudentInfo(true)} 
                />
              </div>

              {/* Student Item */}
              <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white">
                <div className="flex items-center gap-4 w-full">
                  <img
                    src=""
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex flex-row text-sm gap-4 w-full justify-between">
                    <p><span className="font-medium">Student code:</span> GCH123</p>
                    <p><span className="font-medium">Name:</span> Nguyen Van A</p>
                    <p><span className="font-medium">Birth date:</span> xx/xx/xxxx</p>
                    <p><span className="font-medium">Gender:</span> Male</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition">Edit</button>
                    <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition">Delete</button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl border relative">
                    <h2 className="text-lg font-semibold text-center mb-4">Tutor Infographic</h2>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="font-semibold">Name: <span className="font-normal">________</span></p>
                            <p className="font-semibold">ID: <span className="font-normal">________</span></p>
                            <p className="font-semibold">Subject: <span className="font-normal">________</span></p>
                            <p className="font-semibold">Enroll Date: <span className="font-normal">________</span></p>
                            <p className="font-semibold">Description:</p>
                            <div className="border-b w-64"></div>
                            <div className="border-b w-64"></div>
                            <div className="border-b w-64"></div>
                        </div>
                        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16 text-gray-700">
                            <path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm-8 16c0-3.314 3.582-6 8-6s8 2.686 8 6v2H4v-2Z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <button className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700"
                        onClick={() => setShowTutorInfo(true)}
                >Edit Tutor</button>
              </div>

            </div>

            <RightSidebar/>
        </div>

        {showStudentInfo && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <StudentInformation onClose={() => setShowStudentInfo(false)} />
          </div>
        )}

        {showTutorInfo && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <TutorInformation onClose={() => setShowTutorInfo(false)} />
          </div>
        )}
      </div>
    );
}

export default Students;
