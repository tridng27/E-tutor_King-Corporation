import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalContext';
import { ChevronRight, ChevronLeft } from 'lucide-react'; // Import icons

function RightSidebar() {
  const navigate = useNavigate();
  const { logout } = useContext(GlobalContext);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Handle sign out button click
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      {/* Overlay when sidebar is open */}
      {isRightSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"></div>
      )}

      <div
        className={`absolute right-0 top-0 h-full bg-gray-100 p-5 space-y-6 overflow-hidden shadow-xl transition-all duration-500 ${
          isRightSidebarOpen ? "w-64 z-50" : "w-16"
        }`}
        onMouseEnter={() => setIsRightSidebarOpen(true)}
        onMouseLeave={() => setIsRightSidebarOpen(false)}
      >
        {/* Toggle button */}
        <div className="flex justify-start mb-6">
          <button 
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            {isRightSidebarOpen ? 
              <ChevronRight className="w-5 h-5 text-gray-600" /> : 
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            }
          </button>
        </div>

        {/* Sign Out Button */}
        <div className={`flex justify-center items-center mb-10 ${isRightSidebarOpen ? "" : "hidden"}`}>
          <button 
            className="bg-white text-black px-6 py-2 rounded-full shadow-md border hover:bg-gray-100 transition-colors"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>

        {/* Upcoming Section - Only show details when open */}
        <div>
          <h3 className={`text-lg font-bold ${isRightSidebarOpen ? "" : "text-center truncate"}`}>
            {isRightSidebarOpen ? "Upcoming" : "Up"}
          </h3>
          
          {isRightSidebarOpen ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center space-x-3 rounded-lg">
                <span className="bg-yellow-400 p-2 rounded-full"></span>
                <div>
                  <p className="font-bold text-sm">Meeting with Mr Lurah</p>
                  <p className="text-xs">09:20AM <span className="text-orange-500">Due Soon</span></p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rounded-lg">
                <span className="bg-yellow-400 p-2 rounded-full"></span>
                <div>
                  <p className="font-bold text-sm">Meeting with Tok Dalang</p>
                  <p className="text-xs">07:00AM <span className="text-orange-500">Due Soon</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mt-2">
              <span className="bg-yellow-400 p-2 rounded-full"></span>
            </div>
          )}
        </div>

        {/* Recent Activity Section - Only show details when open */}
        <div>
          <h3 className={`text-lg font-bold mt-6 ${isRightSidebarOpen ? "" : "text-center truncate"}`}>
            {isRightSidebarOpen ? "Recent Activity" : "Act"}
          </h3>
          
          {isRightSidebarOpen ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center space-x-3">
                <span className="bg-purple-300 p-2 rounded-full"></span>
                <div>
                  <p className="font-bold text-sm">Submission NLP Programming</p>
                  <p className="text-xs">04 Jan, 09:20AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-green-300 p-2 rounded-full"></span>
                <div>
                  <p className="font-bold text-sm">Outcome Administration</p>
                  <p className="text-xs">04 Jan, 10:20AM</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mt-2">
              <span className="bg-purple-300 p-2 rounded-full"></span>
            </div>
          )}
        </div>

        {/* Latest Message Section - Only show details when open */}
        <div>
          <h3 className={`text-lg font-bold mt-6 ${isRightSidebarOpen ? "" : "text-center truncate"}`}>
            {isRightSidebarOpen ? "Latest Message" : "Msg"}
          </h3>
          
          {isRightSidebarOpen ? (
            <div className="mt-4 flex space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            </div>
          ) : (
            <div className="flex justify-center mt-2">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
